import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import {
  createSessionToken,
  getAuthStatus,
  hashPassword,
  requireAdmin,
  verifyEnvPasscode,
  verifyPassword,
} from './server/auth.ts';
import { UPLOADS_DIR, mutateDatabase, readDatabase } from './server/store.ts';
import type {
  EducationItem,
  ExperienceItem,
  GalleryPhoto,
  InterestItem,
  LanguageItem,
  ObjectivesData,
  PhotoCategory,
  ProfileData,
  ProjectItem,
  SkillItem,
} from './server/types.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();

const ALLOWED_UPLOAD_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// Limitation anti-spam simple en mémoire pour le formulaire de contact
const contactRateLimiter = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const recent = (contactRateLimiter.get(ip) || []).filter((ts) => now - ts < windowMs);
  if (recent.length >= 6) {
    contactRateLimiter.set(ip, recent);
    return true;
  }
  recent.push(now);
  contactRateLimiter.set(ip, recent);
  return false;
}

function isSafeUrl(url: string): boolean {
  if (!url) return true;
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/src/assets/')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 5) return false;
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (mimeType === 'application/pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  return false;
}

function sanitizeText(value: unknown, maxLen = 2000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

async function startServer(): Promise<void> {
  const app = express();

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '12mb' }));

  // Servir les fichiers téléversés en toute sécurité (confinement strict dans UPLOADS_DIR)
  app.get('/uploads/:filename', async (req, res) => {
    const rawName = path.basename(req.params.filename || '');
    if (!/^[a-zA-Z0-9._-]+$/.test(rawName)) {
      res.status(400).json({ error: 'Nom de fichier invalide.' });
      return;
    }
    const resolved = path.resolve(UPLOADS_DIR, rawName);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(403).json({ error: 'Accès interdit.' });
      return;
    }
    try {
      await fs.access(resolved);
      if (rawName.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${rawName}"`);
      }
      res.sendFile(resolved);
    } catch {
      res.status(404).json({ error: 'Fichier introuvable.' });
    }
  });

  // --- ROUTES PUBLIQUES ---

  app.get('/api/portfolio', async (_req, res) => {
    try {
      const db = await readDatabase();
      res.json({ portfolio: db.portfolio });
    } catch (error) {
      console.error('Erreur chargement portfolio:', error);
      res.status(500).json({ error: 'Impossible de charger les données du portfolio.' });
    }
  });

  app.post('/api/contact', async (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({
        error: 'Trop de messages envoyés récemment. Veuillez patienter quelques minutes.',
      });
      return;
    }

    const fullName = sanitizeText(req.body?.fullName, 120);
    const email = sanitizeText(req.body?.email, 160);
    const subject = sanitizeText(req.body?.subject, 180);
    const message = sanitizeText(req.body?.message, 4000);

    if (fullName.length < 2) {
      res.status(400).json({ error: 'Veuillez renseigner votre nom complet.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Veuillez saisir une adresse e-mail valide.' });
      return;
    }
    if (subject.length < 2) {
      res.status(400).json({ error: 'Veuillez indiquer l’objet de votre message.' });
      return;
    }
    if (message.length < 10) {
      res.status(400).json({ error: 'Votre message doit contenir au moins 10 caractères.' });
      return;
    }

    let emailDispatched = false;
    const resendApiKey = process.env.RESEND_API_KEY?.trim();

    if (resendApiKey) {
      const db = await readDatabase();
      const targetEmail =
        process.env.CONTACT_TO_EMAIL?.trim() || db.portfolio.profile.email || 'baldecherifnianao01@gmail.com';
      const fromEmail =
        process.env.CONTACT_FROM_EMAIL?.trim() || 'Portfolio Cherif Balde <onboarding@resend.dev>';

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [targetEmail],
            reply_to: email,
            subject: `[Portfolio Cherif Balde] ${subject}`,
            text: `Nouveau message reçu depuis cherifbalde.com\n\nNom : ${fullName}\nEmail : ${email}\nObjet : ${subject}\n\nMessage :\n${message}`,
          }),
        });
        if (!emailResponse.ok) {
          const errBody = await emailResponse.text();
          console.error('Resend API error:', errBody);
          res.status(502).json({
            error:
              "Le service d'envoi d'e-mails a refusé la transmission. Aucun message n'a été confirmé.",
          });
          return;
        }
        emailDispatched = true;
      } catch (err) {
        console.error('Erreur réseau Resend:', err);
        res.status(502).json({
          error: "Impossible de joindre le serveur d'envoi d'e-mails pour le moment.",
        });
        return;
      }
    }

    try {
      const savedMessage = await mutateDatabase((db) => {
        const entry = {
          id: `msg-${crypto.randomUUID()}`,
          fullName,
          email,
          subject,
          message,
          createdAt: new Date().toISOString(),
          read: false,
          emailDispatched,
        };
        db.messages.unshift(entry);
        return entry;
      });

      res.status(201).json({
        success: true,
        savedToInbox: true,
        emailDispatched,
        messageId: savedMessage.id,
      });
    } catch (error) {
      console.error('Erreur sauvegarde message:', error);
      res.status(500).json({ error: 'Erreur lors de la sauvegarde du message.' });
    }
  });

  // --- AUTHENTIFICATION ADMINISTRATEUR ---

  app.get('/api/auth/status', async (_req, res) => {
    try {
      const status = await getAuthStatus();
      res.json(status);
    } catch (error) {
      console.error('Erreur statut auth:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });

  app.post('/api/auth/setup', async (req, res) => {
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    if (envPasscode) {
      res.status(403).json({
        error: 'Un mot de passe administrateur est déjà défini via les variables d’environnement.',
      });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({
        error: 'Le mot de passe administrateur doit contenir entre 8 et 128 caractères.',
      });
      return;
    }

    const result = await mutateDatabase((db) => {
      if (db.adminPasswordHash) {
        return { alreadyConfigured: true };
      }
      db.adminPasswordHash = hashPassword(password);
      return { alreadyConfigured: false };
    });

    if (result.alreadyConfigured) {
      res.status(409).json({
        error: 'Le compte administrateur a déjà été configuré. Veuillez vous connecter.',
      });
      return;
    }

    const token = createSessionToken();
    res.status(201).json({ token });
  });

  app.post('/api/auth/login', async (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password) {
      res.status(400).json({ error: 'Veuillez saisir votre mot de passe.' });
      return;
    }

    const envPasscode = process.env.ADMIN_PASSCODE?.trim();
    if (envPasscode) {
      if (!verifyEnvPasscode(password, envPasscode)) {
        res.status(401).json({ error: 'Mot de passe incorrect.' });
        return;
      }
      res.json({ token: createSessionToken() });
      return;
    }

    const db = await readDatabase();
    if (!db.adminPasswordHash) {
      res.status(400).json({
        error: 'Aucun mot de passe administrateur configuré. Veuillez initialiser le compte.',
      });
      return;
    }

    if (!verifyPassword(password, db.adminPasswordHash)) {
      res.status(401).json({ error: 'Mot de passe incorrect.' });
      return;
    }

    res.json({ token: createSessionToken() });
  });

  app.get('/api/auth/verify', requireAdmin, (_req, res) => {
    res.json({ authenticated: true });
  });

  // --- ROUTES PROTÉGÉES DU TABLEAU DE BORD ADMINISTRATEUR ---

  app.get('/api/admin/dashboard', requireAdmin, async (_req, res) => {
    try {
      const db = await readDatabase();
      res.json({
        portfolio: db.portfolio,
        messages: db.messages,
        emailServiceConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
      });
    } catch (error) {
      console.error('Erreur dashboard admin:', error);
      res.status(500).json({ error: 'Impossible de charger les données administrateur.' });
    }
  });

  app.put('/api/admin/profile', requireAdmin, async (req, res) => {
    const incoming = req.body as Partial<ProfileData> | undefined;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Données de profil invalides.' });
      return;
    }

    const urlFields = [
      incoming.websiteUrl,
      incoming.cvPdfUrl,
      incoming.social?.github,
      incoming.social?.tiktok,
      incoming.social?.linkedin,
      incoming.social?.website,
      incoming.social?.other,
    ];
    for (const u of urlFields) {
      if (typeof u === 'string' && u.trim() && !isSafeUrl(u)) {
        res.status(400).json({ error: `URL non autorisée : ${u}` });
        return;
      }
    }

    const updated = await mutateDatabase((db) => {
      const current = db.portfolio.profile;
      db.portfolio.profile = {
        ...current,
        fullName: sanitizeText(incoming.fullName ?? current.fullName, 120) || current.fullName,
        titleFr: sanitizeText(incoming.titleFr ?? current.titleFr, 140),
        titleEn: sanitizeText(incoming.titleEn ?? current.titleEn, 140),
        taglineFr: sanitizeText(incoming.taglineFr ?? current.taglineFr, 300),
        taglineEn: sanitizeText(incoming.taglineEn ?? current.taglineEn, 300),
        heroSummaryFr: sanitizeText(incoming.heroSummaryFr ?? current.heroSummaryFr, 600),
        heroSummaryEn: sanitizeText(incoming.heroSummaryEn ?? current.heroSummaryEn, 600),
        aboutStoryFr: Array.isArray(incoming.aboutStoryFr)
          ? incoming.aboutStoryFr.map((p) => sanitizeText(p, 800)).filter(Boolean)
          : current.aboutStoryFr,
        aboutStoryEn: Array.isArray(incoming.aboutStoryEn)
          ? incoming.aboutStoryEn.map((p) => sanitizeText(p, 800)).filter(Boolean)
          : current.aboutStoryEn,
        locationFr: sanitizeText(incoming.locationFr ?? current.locationFr, 120),
        locationEn: sanitizeText(incoming.locationEn ?? current.locationEn, 120),
        availabilityFr: sanitizeText(incoming.availabilityFr ?? current.availabilityFr, 200),
        availabilityEn: sanitizeText(incoming.availabilityEn ?? current.availabilityEn, 200),
        email: sanitizeText(incoming.email ?? current.email, 160),
        phone: sanitizeText(incoming.phone ?? current.phone, 40),
        websiteUrl: sanitizeText(incoming.websiteUrl ?? current.websiteUrl, 240),
        cvPdfUrl: sanitizeText(incoming.cvPdfUrl ?? current.cvPdfUrl, 300),
        heroPhotoId:
          incoming.heroPhotoId !== undefined ? incoming.heroPhotoId : current.heroPhotoId,
        aboutPhotoId:
          incoming.aboutPhotoId !== undefined ? incoming.aboutPhotoId : current.aboutPhotoId,
        social: {
          github: sanitizeText(incoming.social?.github ?? current.social.github, 240),
          tiktok: sanitizeText(incoming.social?.tiktok ?? current.social.tiktok, 240),
          linkedin: sanitizeText(incoming.social?.linkedin ?? current.social.linkedin, 240),
          whatsapp: sanitizeText(incoming.social?.whatsapp ?? current.social.whatsapp, 40),
          website: sanitizeText(incoming.social?.website ?? current.social.website, 240),
          other: sanitizeText(incoming.social?.other ?? current.social.other, 240),
        },
      };
      return db.portfolio.profile;
    });

    res.json({ profile: updated });
  });

  app.put('/api/admin/section/:section', requireAdmin, async (req, res) => {
    const section = req.params.section;
    const payload = req.body;

    try {
      const updated = await mutateDatabase((db) => {
        if (section === 'education' && Array.isArray(payload)) {
          db.portfolio.education = payload.map((item: EducationItem) => ({
            id: sanitizeText(item.id, 80) || `edu-${crypto.randomUUID()}`,
            period: sanitizeText(item.period, 80),
            titleFr: sanitizeText(item.titleFr, 220),
            titleEn: sanitizeText(item.titleEn, 220),
            institution: sanitizeText(item.institution, 220),
            location: sanitizeText(item.location, 120),
            status: item.status === 'envisaged' ? 'envisaged' : 'validated',
            descriptionFr: sanitizeText(item.descriptionFr, 600),
            descriptionEn: sanitizeText(item.descriptionEn, 600),
            certificateUrl: item.certificateUrl && isSafeUrl(item.certificateUrl)
              ? sanitizeText(item.certificateUrl, 300)
              : '',
            certificateName: sanitizeText(item.certificateName || '', 120),
          }));
          return db.portfolio.education;
        }

        if (section === 'skills' && Array.isArray(payload)) {
          db.portfolio.skills = payload.map((item: SkillItem) => ({
            id: sanitizeText(item.id, 80) || `sk-${crypto.randomUUID()}`,
            category:
              item.category === 'multimedia' || item.category === 'tools'
                ? item.category
                : 'web',
            nameFr: sanitizeText(item.nameFr, 160),
            nameEn: sanitizeText(item.nameEn, 160),
            level:
              typeof item.level === 'number' && Number.isFinite(item.level)
                ? Math.max(0, Math.min(100, Math.round(item.level)))
                : null,
            levelLabelFr: sanitizeText(item.levelLabelFr || '', 80),
            levelLabelEn: sanitizeText(item.levelLabelEn || '', 80),
          }));
          return db.portfolio.skills;
        }

        if (section === 'projects' && Array.isArray(payload)) {
          db.portfolio.projects = payload.map((item: ProjectItem) => ({
            id: sanitizeText(item.id, 80) || `proj-${crypto.randomUUID()}`,
            title: sanitizeText(item.title, 140),
            category:
              item.category === 'events' || item.category === 'personal'
                ? item.category
                : 'ecommerce',
            status:
              item.status === 'completed' || item.status === 'in_progress'
                ? item.status
                : 'concept',
            descriptionFr: sanitizeText(item.descriptionFr, 800),
            descriptionEn: sanitizeText(item.descriptionEn, 800),
            technologies: Array.isArray(item.technologies)
              ? item.technologies.map((t) => sanitizeText(t, 40)).filter(Boolean)
              : [],
            imageUrl: isSafeUrl(item.imageUrl || '') ? sanitizeText(item.imageUrl, 300) : '',
            liveUrl: isSafeUrl(item.liveUrl || '') ? sanitizeText(item.liveUrl, 300) : '',
            githubUrl: isSafeUrl(item.githubUrl || '') ? sanitizeText(item.githubUrl, 300) : '',
          }));
          return db.portfolio.projects;
        }

        if (section === 'experiences' && Array.isArray(payload)) {
          db.portfolio.experiences = payload.map((item: ExperienceItem) => ({
            id: sanitizeText(item.id, 80) || `exp-${crypto.randomUUID()}`,
            roleFr: sanitizeText(item.roleFr, 180),
            roleEn: sanitizeText(item.roleEn, 180),
            companyOrSectorFr: sanitizeText(item.companyOrSectorFr, 180),
            companyOrSectorEn: sanitizeText(item.companyOrSectorEn, 180),
            location: sanitizeText(item.location, 120),
            period: sanitizeText(item.period, 80),
            missionsFr: Array.isArray(item.missionsFr)
              ? item.missionsFr.map((m) => sanitizeText(m, 300)).filter(Boolean)
              : [],
            missionsEn: Array.isArray(item.missionsEn)
              ? item.missionsEn.map((m) => sanitizeText(m, 300)).filter(Boolean)
              : [],
            highlightsFr: Array.isArray(item.highlightsFr)
              ? item.highlightsFr.map((h) => sanitizeText(h, 80)).filter(Boolean)
              : [],
            highlightsEn: Array.isArray(item.highlightsEn)
              ? item.highlightsEn.map((h) => sanitizeText(h, 80)).filter(Boolean)
              : [],
          }));
          return db.portfolio.experiences;
        }

        if (section === 'languages' && Array.isArray(payload)) {
          db.portfolio.languages = payload.map((item: LanguageItem) => ({
            id: sanitizeText(item.id, 80) || `lang-${crypto.randomUUID()}`,
            nameFr: sanitizeText(item.nameFr, 80),
            nameEn: sanitizeText(item.nameEn, 80),
            proficiencyFr: sanitizeText(item.proficiencyFr, 120),
            proficiencyEn: sanitizeText(item.proficiencyEn, 120),
          }));
          return db.portfolio.languages;
        }

        if (section === 'objectives' && payload && typeof payload === 'object') {
          const obj = payload as ObjectivesData;
          db.portfolio.objectives = {
            sectionTitleFr: sanitizeText(obj.sectionTitleFr, 180),
            sectionTitleEn: sanitizeText(obj.sectionTitleEn, 180),
            quoteFr: sanitizeText(obj.quoteFr, 300),
            quoteEn: sanitizeText(obj.quoteEn, 300),
            itemsFr: Array.isArray(obj.itemsFr)
              ? obj.itemsFr.map((i) => sanitizeText(i, 240)).filter(Boolean)
              : db.portfolio.objectives.itemsFr,
            itemsEn: Array.isArray(obj.itemsEn)
              ? obj.itemsEn.map((i) => sanitizeText(i, 240)).filter(Boolean)
              : db.portfolio.objectives.itemsEn,
          };
          return db.portfolio.objectives;
        }

        if (section === 'interests' && Array.isArray(payload)) {
          db.portfolio.interests = payload.map((item: InterestItem) => ({
            id: sanitizeText(item.id, 80) || `int-${crypto.randomUUID()}`,
            labelFr: sanitizeText(item.labelFr, 120),
            labelEn: sanitizeText(item.labelEn, 120),
            iconKey: item.iconKey || 'cpu',
          }));
          return db.portfolio.interests;
        }

        return null;
      });

      if (updated === null) {
        res.status(400).json({ error: 'Section ou format de données invalide.' });
        return;
      }

      res.json({ data: updated });
    } catch (error) {
      console.error('Erreur mise à jour section:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
    }
  });

  // Upload sécurisé d'images (JPG/PNG/WebP) et de documents PDF
  app.post('/api/admin/upload', requireAdmin, async (req, res) => {
    const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : '';
    const base64Data = typeof req.body?.data === 'string' ? req.body.data : '';
    const originalName = sanitizeText(req.body?.filename || 'fichier', 120);

    const ext = ALLOWED_UPLOAD_EXT[mimeType];
    if (!ext) {
      res.status(400).json({
        error: 'Format non pris en charge. Formats acceptés : JPG, PNG, WebP ou PDF.',
      });
      return;
    }

    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
      res.status(400).json({ error: 'La taille du fichier doit être inférieure à 8 Mo.' });
      return;
    }

    if (!verifyMagicBytes(buffer, mimeType)) {
      res.status(400).json({
        error: 'Le contenu du fichier ne correspond pas au format déclaré.',
      });
      return;
    }

    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const safeFilename = `${crypto.randomUUID()}.${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, safeFilename);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(403).json({ error: 'Chemin de fichier refusé.' });
      return;
    }

    await fs.writeFile(targetPath, buffer);
    res.status(201).json({
      url: `/uploads/${safeFilename}`,
      filename: originalName,
      mimeType,
    });
  });

  // Gestion de la galerie photographique
  app.post('/api/admin/gallery', requireAdmin, async (req, res) => {
    const url = sanitizeText(req.body?.url, 300);
    if (!url || !isSafeUrl(url)) {
      res.status(400).json({ error: 'URL de photographie invalide.' });
      return;
    }
    const validCategories: PhotoCategory[] = [
      'portrait',
      'attire',
      'workspace',
      'presentation',
      'events',
      'other',
    ];
    const category = validCategories.includes(req.body?.category)
      ? (req.body.category as PhotoCategory)
      : 'portrait';

    const photo: GalleryPhoto = {
      id: `photo-${crypto.randomUUID()}`,
      url,
      captionFr: sanitizeText(req.body?.captionFr, 240),
      captionEn: sanitizeText(req.body?.captionEn, 240),
      category,
      uploadedAt: new Date().toISOString(),
    };

    await mutateDatabase((db) => {
      db.portfolio.gallery.unshift(photo);
      if (req.body?.setAsHero) {
        db.portfolio.profile.heroPhotoId = photo.id;
      }
      if (req.body?.setAsAbout) {
        db.portfolio.profile.aboutPhotoId = photo.id;
      }
    });

    res.status(201).json({ photo });
  });

  app.put('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
    const photoId = req.params.id;
    const validCategories: PhotoCategory[] = [
      'portrait',
      'attire',
      'workspace',
      'presentation',
      'events',
      'other',
    ];

    const updated = await mutateDatabase((db) => {
      const target = db.portfolio.gallery.find((p) => p.id === photoId);
      if (!target) return null;
      if (typeof req.body?.captionFr === 'string') {
        target.captionFr = sanitizeText(req.body.captionFr, 240);
      }
      if (typeof req.body?.captionEn === 'string') {
        target.captionEn = sanitizeText(req.body.captionEn, 240);
      }
      if (validCategories.includes(req.body?.category)) {
        target.category = req.body.category as PhotoCategory;
      }
      if (typeof req.body?.url === 'string' && isSafeUrl(req.body.url)) {
        target.url = sanitizeText(req.body.url, 300);
      }
      if (req.body?.setAsHero === true) {
        db.portfolio.profile.heroPhotoId = target.id;
      }
      if (req.body?.setAsAbout === true) {
        db.portfolio.profile.aboutPhotoId = target.id;
      }
      return target;
    });

    if (!updated) {
      res.status(404).json({ error: 'Photographie introuvable.' });
      return;
    }
    res.json({ photo: updated });
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
    const photoId = req.params.id;
    const deletedUrl = await mutateDatabase((db) => {
      const idx = db.portfolio.gallery.findIndex((p) => p.id === photoId);
      if (idx === -1) return null;
      const [removed] = db.portfolio.gallery.splice(idx, 1);
      if (db.portfolio.profile.heroPhotoId === photoId) {
        db.portfolio.profile.heroPhotoId = null;
      }
      if (db.portfolio.profile.aboutPhotoId === photoId) {
        db.portfolio.profile.aboutPhotoId = null;
      }
      return removed.url;
    });

    if (!deletedUrl) {
      res.status(404).json({ error: 'Photographie introuvable.' });
      return;
    }

    if (deletedUrl.startsWith('/uploads/')) {
      const fileName = path.basename(deletedUrl);
      const resolved = path.resolve(UPLOADS_DIR, fileName);
      if (resolved.startsWith(UPLOADS_DIR + path.sep)) {
        await fs.unlink(resolved).catch(() => undefined);
      }
    }

    res.json({ deleted: true });
  });

  // Gestion des messages reçus
  app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    const msgId = req.params.id;
    const updated = await mutateDatabase((db) => {
      const msg = db.messages.find((m) => m.id === msgId);
      if (!msg) return null;
      msg.read = Boolean(req.body?.read);
      return msg;
    });
    if (!updated) {
      res.status(404).json({ error: 'Message introuvable.' });
      return;
    }
    res.json({ message: updated });
  });

  app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    const msgId = req.params.id;
    const removed = await mutateDatabase((db) => {
      const idx = db.messages.findIndex((m) => m.id === msgId);
      if (idx === -1) return false;
      db.messages.splice(idx, 1);
      return true;
    });
    if (!removed) {
      res.status(404).json({ error: 'Message introuvable.' });
      return;
    }
    res.json({ deleted: true });
  });

  // Vite en développement, build statique dist/ en production
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur Cherif Balde actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Échec démarrage serveur:', err);
  process.exit(1);
});
