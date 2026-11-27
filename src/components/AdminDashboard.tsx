import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  FileText,
  Image as ImageIcon,
  Inbox,
  Lock,
  LogOut,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';
import type {
  ContactMessage,
  EducationItem,
  ExperienceItem,
  GalleryPhoto,
  InterestItem,
  LanguageCode,
  LanguageItem,
  PhotoCategory,
  PortfolioData,
  ProjectCategory,
  ProjectItem,
  ProjectStatus,
  SkillCategory,
  SkillItem,
} from '../types/portfolio';
import { getPhotoCategoryLabel } from '../i18n/translations';

interface AdminDashboardProps {
  portfolio: PortfolioData;
  lang: LanguageCode;
  onPortfolioUpdated: (next: PortfolioData) => void;
  onNavigate: (path: string, sectionId?: string) => void;
}

type AdminTab =
  | 'profile'
  | 'gallery'
  | 'education'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'objectives'
  | 'messages';

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

export function AdminDashboard({
  portfolio,
  lang,
  onPortfolioUpdated,
  onNavigate,
}: AdminDashboardProps) {
  // Jeton conservé uniquement en mémoire React (jamais dans localStorage)
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{
    configured: boolean;
    envOverride: boolean;
    needsSetup: boolean;
  } | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [draft, setDraft] = useState<PortfolioData>(portfolio);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [emailServiceConfigured, setEmailServiceConfigured] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // État pour l'ajout de photo dans la galerie
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string>('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<PhotoCategory>('portrait');
  const [newPhotoCaptionFr, setNewPhotoCaptionFr] = useState('');
  const [newPhotoCaptionEn, setNewPhotoCaptionEn] = useState('');
  const [setAsHeroOnUpload, setSetAsHeroOnUpload] = useState(false);
  const [setAsAboutOnUpload, setSetAsAboutOnUpload] = useState(false);

  useEffect(() => {
    setDraft(portfolio);
  }, [portfolio]);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data) => setAuthStatus(data))
      .catch(() => setAuthStatus({ configured: false, envOverride: false, needsSetup: true }));
  }, []);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadDashboard = useCallback(
    async (bearer: string) => {
      try {
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${bearer}` },
        });
        if (!res.ok) {
          setToken(null);
          return;
        }
        const data = (await res.json()) as {
          portfolio: PortfolioData;
          messages: ContactMessage[];
          emailServiceConfigured: boolean;
        };
        setDraft(data.portfolio);
        onPortfolioUpdated(data.portfolio);
        setMessages(data.messages);
        setEmailServiceConfigured(data.emailServiceConfigured);
      } catch {
        showNotice('err', 'Impossible de charger les données administrateur.');
      }
    },
    [onPortfolioUpdated]
  );

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authStatus?.needsSetup && password !== confirmPassword) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setAuthLoading(true);
    try {
      const endpoint = authStatus?.needsSetup ? '/api/auth/setup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Authentification refusée.');
        return;
      }
      setToken(data.token);
      setPassword('');
      setConfirmPassword('');
      await loadDashboard(data.token);
    } catch {
      setAuthError('Erreur réseau lors de l’authentification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const uploadBinaryFile = async (file: File): Promise<string> => {
    if (!token) throw new Error('Non authentifié.');
    const base64 = await fileToBase64(file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        data: base64,
      }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Échec du téléversement.');
    }
    return data.url;
  };

  const saveProfile = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft.profile),
      });
      const data = (await res.json()) as { profile?: PortfolioData['profile']; error?: string };
      if (!res.ok || !data.profile) {
        showNotice('err', data.error || 'Erreur lors de la sauvegarde du profil.');
        return;
      }
      const next = { ...draft, profile: data.profile };
      setDraft(next);
      onPortfolioUpdated(next);
      showNotice('ok', 'Profil et textes enregistrés.');
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (
    section:
      | 'education'
      | 'skills'
      | 'projects'
      | 'experiences'
      | 'languages'
      | 'objectives'
      | 'interests',
    payload: unknown,
    successText: string
  ) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/section/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { data?: unknown; error?: string };
      if (!res.ok || !data.data) {
        showNotice('err', data.error || 'Erreur lors de la sauvegarde.');
        return;
      }
      const next = { ...draft, [section]: data.data } as PortfolioData;
      setDraft(next);
      onPortfolioUpdated(next);
      showNotice('ok', successText);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setNewPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleAddGalleryPhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newPhotoFile) return;
    setSaving(true);
    try {
      const uploadedUrl = await uploadBinaryFile(newPhotoFile);
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: uploadedUrl,
          category: newPhotoCategory,
          captionFr: newPhotoCaptionFr,
          captionEn: newPhotoCaptionEn,
          setAsHero: setAsHeroOnUpload,
          setAsAbout: setAsAboutOnUpload,
        }),
      });
      const data = (await res.json()) as { photo?: GalleryPhoto; error?: string };
      if (!res.ok || !data.photo) {
        showNotice('err', data.error || 'Impossible d’ajouter la photographie.');
        return;
      }
      setNewPhotoFile(null);
      setNewPhotoPreview('');
      setNewPhotoCaptionFr('');
      setNewPhotoCaptionEn('');
      setSetAsHeroOnUpload(false);
      setSetAsAboutOnUpload(false);
      await loadDashboard(token);
      showNotice('ok', 'Photographie ajoutée à la galerie.');
    } catch (err) {
      showNotice('err', err instanceof Error ? err.message : 'Erreur d’envoi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPhotoRole = async (photoId: string, role: 'hero' | 'about') => {
    if (!token) return;
    const res = await fetch(`/api/admin/gallery/${photoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(role === 'hero' ? { setAsHero: true } : { setAsAbout: true }),
    });
    if (res.ok) {
      await loadDashboard(token);
      showNotice(
        'ok',
        role === 'hero'
          ? 'Photo principale du site mise à jour.'
          : 'Photo de la section À propos mise à jour.'
      );
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/gallery/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await loadDashboard(token);
      showNotice('ok', 'Photographie supprimée.');
    }
  };

  const handleToggleMessageRead = async (msg: ContactMessage) => {
    if (!token) return;
    const res = await fetch(`/api/admin/messages/${msg.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ read: !msg.read }),
    });
    if (res.ok) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
      );
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showNotice('ok', 'Message supprimé.');
    }
  };

  // --- ÉCRAN DE CONNEXION / CONFIGURATION INITIALE ---
  if (!token) {
    return (
      <main className="flex min-h-[82vh] items-center justify-center bg-[#FAFAFA] px-5 py-16 dark:bg-[#0B0B0D]">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 dark:border-white/10 dark:bg-[#141418]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B0B0D] text-[#C8A45D] border border-[#C8A45D]/40">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                {authStatus?.needsSetup
                  ? 'Initialisation Administrateur'
                  : 'Espace Administrateur'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Cherif Balde · Gestion privée du portfolio
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            {authStatus?.needsSetup && (
              <p className="rounded-lg border border-[#C8A45D]/35 bg-[#C8A45D]/10 p-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-200">
                Définissez votre mot de passe administrateur (8 caractères minimum). Il sera haché
                de manière sécurisée sur le serveur.
              </p>
            )}

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                required
                minLength={authStatus?.needsSetup ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
              />
            </div>

            {authStatus?.needsSetup && (
              <div>
                <label
                  htmlFor="admin-password-confirm"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="admin-password-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                />
              </div>
            )}

            {authError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading || !authStatus}
              className="w-full rounded-lg bg-[#C8A45D] px-4 py-2.5 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572] disabled:opacity-60"
            >
              {authLoading
                ? 'Vérification...'
                : authStatus?.needsSetup
                  ? 'Créer l’accès administrateur'
                  : 'Se connecter'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => onNavigate('/', 'accueil')}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-[#0B0B0D] dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour au site public</span>
          </button>
        </div>
      </main>
    );
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  const tabs: Array<{ key: AdminTab; label: string }> = [
    { key: 'profile', label: 'Profil & Coordonnées' },
    { key: 'gallery', label: `Galerie (${draft.gallery.length})` },
    { key: 'education', label: 'Parcours & PDF' },
    { key: 'skills', label: 'Compétences' },
    { key: 'projects', label: 'Projets' },
    { key: 'experience', label: 'Expériences & Langues' },
    { key: 'objectives', label: 'Objectifs & Intérêts' },
    { key: 'messages', label: `Messages (${unreadCount > 0 ? `${unreadCount} non lus` : messages.length})` },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-10 dark:bg-[#0B0B0D]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* En-tête du tableau de bord */}
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center dark:border-white/10">
          <div>
            <p className="text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]">
              Administration privée
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-[#0B0B0D] dark:text-white">
              Tableau de bord — {draft.profile.fullName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/', 'accueil')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-[#C8A45D] dark:border-white/15 dark:bg-[#141418] dark:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voir le portfolio</span>
            </button>

            <button
              type="button"
              onClick={() => setToken(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:border-rose-400 dark:border-white/15 dark:bg-[#141418] dark:text-zinc-200"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="mt-6 flex flex-wrap gap-1.5 rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-white/10 dark:bg-[#141418]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#C8A45D] text-[#0B0B0D]'
                  : 'text-zinc-600 hover:text-[#0B0B0D] dark:text-zinc-300 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {notice && (
          <div
            role="status"
            className={`mt-5 rounded-lg border px-4 py-3 text-xs font-medium ${
              notice.type === 'ok'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* ONGLET 1 : PROFIL, COORDONNÉES, RÉSEAUX & CV PDF */}
        {activeTab === 'profile' && (
          <section className="mt-8 space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
            <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
              Identité, textes & coordonnées
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Nom complet"
                value={draft.profile.fullName}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, fullName: v } })
                }
              />
              <Field
                label="Email professionnel"
                value={draft.profile.email}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, email: v } })
                }
              />
              <Field
                label="Titre professionnel (FR)"
                value={draft.profile.titleFr}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, titleFr: v } })
                }
              />
              <Field
                label="Titre professionnel (EN)"
                value={draft.profile.titleEn}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, titleEn: v } })
                }
              />
              <Field
                label="Téléphone"
                value={draft.profile.phone}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, phone: v } })
                }
              />
              <Field
                label="Numéro WhatsApp (avec indicatif)"
                value={draft.profile.social.whatsapp}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      social: { ...draft.profile.social, whatsapp: v },
                    },
                  })
                }
              />
              <Field
                label="Localisation (FR)"
                value={draft.profile.locationFr}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, locationFr: v } })
                }
              />
              <Field
                label="Site web"
                value={draft.profile.websiteUrl}
                onChange={(v) =>
                  setDraft({ ...draft, profile: { ...draft.profile, websiteUrl: v } })
                }
              />
              <Field
                label="GitHub URL"
                value={draft.profile.social.github}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      social: { ...draft.profile.social, github: v },
                    },
                  })
                }
              />
              <Field
                label="TikTok URL"
                value={draft.profile.social.tiktok}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      social: { ...draft.profile.social, tiktok: v },
                    },
                  })
                }
              />
              <Field
                label="LinkedIn URL"
                value={draft.profile.social.linkedin}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      social: { ...draft.profile.social, linkedin: v },
                    },
                  })
                }
              />
              <Field
                label="Autre réseau social URL"
                value={draft.profile.social.other}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      social: { ...draft.profile.social, other: v },
                    },
                  })
                }
              />
            </div>

            <Field
              label="Phrase d'accroche (FR)"
              value={draft.profile.taglineFr}
              onChange={(v) =>
                setDraft({ ...draft, profile: { ...draft.profile, taglineFr: v } })
              }
            />

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Présentation À propos (FR — un paragraphe par ligne)
              </label>
              <textarea
                rows={5}
                value={draft.profile.aboutStoryFr.join('\n')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      aboutStoryFr: e.target.value.split('\n'),
                    },
                  })
                }
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-[#0B0B0D] outline-none focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
              />
            </div>

            {/* Téléversement d'un CV PDF personnalisé */}
            <div className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4 dark:border-white/10 dark:bg-[#0B0B0D]">
              <p className="text-xs font-semibold text-[#0B0B0D] dark:text-white">
                CV PDF personnalisé (optionnel)
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Par défaut, le bouton « Télécharger mon CV » génère automatiquement un CV PDF propre à
                partir de vos données. Vous pouvez aussi importer votre propre fichier PDF ci-dessous.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#C8A45D] px-3.5 py-2 text-xs font-semibold text-[#9A7B38] hover:bg-[#C8A45D]/10 dark:text-[#C8A45D]">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Importer un CV (PDF)</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const url = await uploadBinaryFile(f);
                        setDraft({
                          ...draft,
                          profile: { ...draft.profile, cvPdfUrl: url },
                        });
                        showNotice('ok', 'CV PDF importé. Cliquez sur Enregistrer.');
                      } catch (err) {
                        showNotice('err', err instanceof Error ? err.message : 'Erreur import PDF');
                      }
                    }}
                  />
                </label>
                {draft.profile.cvPdfUrl && (
                  <>
                    <a
                      href={draft.profile.cvPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#C8A45D] hover:underline"
                    >
                      Voir le PDF actuel
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          profile: { ...draft.profile, cvPdfUrl: '' },
                        })
                      }
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Revenir au CV auto-généré
                    </button>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={saveProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D6B572] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer le profil</span>
            </button>
          </section>
        )}

        {/* ONGLET 2 : GALERIE PHOTOGRAPHIQUE */}
        {activeTab === 'gallery' && (
          <section className="mt-8 space-y-8">
            <form
              onSubmit={handleAddGalleryPhoto}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]"
            >
              <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                Ajouter une photographie personnelle
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Formats acceptés : JPG, PNG, WebP (8 Mo max). Utilisez exclusivement vos véritables
                photographies.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-[#FAFAFA] p-6 text-center hover:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D]">
                    {newPhotoPreview ? (
                      <img
                        src={newPhotoPreview}
                        alt="Aperçu"
                        className="max-h-48 rounded-lg object-contain"
                      />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-[#C8A45D]" />
                        <span className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Sélectionner une photo depuis votre ordinateur
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Catégorie
                    </label>
                    <select
                      value={newPhotoCategory}
                      onChange={(e) => setNewPhotoCategory(e.target.value as PhotoCategory)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                    >
                      {(
                        [
                          'portrait',
                          'attire',
                          'workspace',
                          'presentation',
                          'events',
                          'other',
                        ] as PhotoCategory[]
                      ).map((c) => (
                        <option key={c} value={c}>
                          {getPhotoCategoryLabel(c, lang)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label="Légende (FR)"
                    value={newPhotoCaptionFr}
                    onChange={setNewPhotoCaptionFr}
                  />
                  <Field
                    label="Légende (EN)"
                    value={newPhotoCaptionEn}
                    onChange={setNewPhotoCaptionEn}
                  />

                  <div className="flex flex-wrap gap-4 pt-1 text-xs">
                    <label className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={setAsHeroOnUpload}
                        onChange={(e) => setSetAsHeroOnUpload(e.target.checked)}
                      />
                      <span>Définir comme photo principale (Accueil)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={setAsAboutOnUpload}
                        onChange={(e) => setSetAsAboutOnUpload(e.target.checked)}
                      />
                      <span>Définir pour la section À propos</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !newPhotoFile}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D6B572] disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                <span>Téléverser dans la galerie</span>
              </button>
            </form>

            {/* Liste des photographies existantes */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {draft.gallery.map((photo) => {
                const isHero = draft.profile.heroPhotoId === photo.id;
                const isAbout = draft.profile.aboutPhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#141418]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.captionFr || 'Photo Cherif Balde'}
                      referrerPolicy="no-referrer"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <p className="text-xs font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                        {getPhotoCategoryLabel(photo.category, lang)}
                      </p>
                      <p className="text-sm font-medium text-[#0B0B0D] dark:text-white">
                        {photo.captionFr || 'Sans légende'}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSetPhotoRole(photo.id, 'hero')}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                            isHero
                              ? 'bg-[#C8A45D] text-[#0B0B0D]'
                              : 'border border-zinc-200 text-zinc-700 dark:border-white/15 dark:text-zinc-200'
                          }`}
                        >
                          <Star className="h-3 w-3" />
                          <span>{isHero ? 'Photo Accueil active' : 'Mettre en Accueil'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPhotoRole(photo.id, 'about')}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                            isAbout
                              ? 'bg-[#C8A45D] text-[#0B0B0D]'
                              : 'border border-zinc-200 text-zinc-700 dark:border-white/15 dark:text-zinc-200'
                          }`}
                        >
                          <UserCheck className="h-3 w-3" />
                          <span>{isAbout ? 'Photo À propos active' : 'Mettre en À propos'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryPhoto(photo.id)}
                          className="ml-auto inline-flex items-center gap-1 rounded-md border border-rose-500/30 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ONGLET 3 : PARCOURS ACADÉMIQUE & JUSTIFICATIFS PDF/IMAGE */}
        {activeTab === 'education' && (
          <section className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                Parcours académique & certificats
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newItem: EducationItem = {
                    id: `edu-${Date.now()}`,
                    period: '2026',
                    titleFr: 'Nouvelle formation ou certification',
                    titleEn: 'New degree or certification',
                    institution: '',
                    location: 'Casablanca, Maroc',
                    status: 'validated',
                    descriptionFr: '',
                    descriptionEn: '',
                  };
                  setDraft({ ...draft, education: [newItem, ...draft.education] });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8A45D] px-3 py-1.5 text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter une formation</span>
              </button>
            </div>

            <div className="space-y-4">
              {draft.education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-white/10"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field
                      label="Période / Année"
                      value={edu.period}
                      onChange={(v) => {
                        const next = [...draft.education];
                        next[idx] = { ...edu, period: v };
                        setDraft({ ...draft, education: next });
                      }}
                    />
                    <Field
                      label="Établissement"
                      value={edu.institution}
                      onChange={(v) => {
                        const next = [...draft.education];
                        next[idx] = { ...edu, institution: v };
                        setDraft({ ...draft, education: next });
                      }}
                    />
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Statut
                      </label>
                      <select
                        value={edu.status}
                        onChange={(e) => {
                          const next = [...draft.education];
                          next[idx] = {
                            ...edu,
                            status: e.target.value as 'validated' | 'envisaged',
                          };
                          setDraft({ ...draft, education: next });
                        }}
                        className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                      >
                        <option value="validated">Diplôme obtenu / Validé</option>
                        <option value="envisaged">Formation envisagée</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      label="Intitulé (FR)"
                      value={edu.titleFr}
                      onChange={(v) => {
                        const next = [...draft.education];
                        next[idx] = { ...edu, titleFr: v };
                        setDraft({ ...draft, education: next });
                      }}
                    />
                    <Field
                      label="Lieu"
                      value={edu.location}
                      onChange={(v) => {
                        const next = [...draft.education];
                        next[idx] = { ...edu, location: v };
                        setDraft({ ...draft, education: next });
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-white/15">
                        <FileText className="h-3.5 w-3.5 text-[#C8A45D]" />
                        <span>Joindre certificat (PDF / Image)</span>
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              const url = await uploadBinaryFile(f);
                              const next = [...draft.education];
                              next[idx] = {
                                ...edu,
                                certificateUrl: url,
                                certificateName: f.name,
                              };
                              setDraft({ ...draft, education: next });
                              showNotice('ok', 'Justificatif joint. Pensez à enregistrer.');
                            } catch (err) {
                              showNotice(
                                'err',
                                err instanceof Error ? err.message : 'Erreur import'
                              );
                            }
                          }}
                        />
                      </label>
                      {edu.certificateUrl && (
                        <a
                          href={edu.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C8A45D] hover:underline"
                        >
                          {edu.certificateName || 'Justificatif joint'}
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          education: draft.education.filter((x) => x.id !== edu.id),
                        })
                      }
                      className="text-xs font-medium text-rose-500 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                saveSection('education', draft.education, 'Parcours académique enregistré.')
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D6B572]"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer le parcours</span>
            </button>
          </section>
        )}

        {/* ONGLET 4 : COMPÉTENCES & NIVEAUX MODIFIABLES */}
        {activeTab === 'skills' && (
          <section className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                  Compétences & niveaux personnalisables
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Laissez le niveau vide si vous ne souhaitez pas afficher de barre de pourcentage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const sk: SkillItem = {
                    id: `sk-${Date.now()}`,
                    category: 'web',
                    nameFr: 'Nouvelle compétence',
                    nameEn: 'New skill',
                    level: null,
                    levelLabelFr: '',
                    levelLabelEn: '',
                  };
                  setDraft({ ...draft, skills: [...draft.skills, sk] });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8A45D] px-3 py-1.5 text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter une compétence</span>
              </button>
            </div>

            <div className="space-y-3">
              {draft.skills.map((skill, idx) => (
                <div
                  key={skill.id}
                  className="grid grid-cols-1 items-end gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-12 dark:border-white/10"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Catégorie
                    </label>
                    <select
                      value={skill.category}
                      onChange={(e) => {
                        const next = [...draft.skills];
                        next[idx] = { ...skill, category: e.target.value as SkillCategory };
                        setDraft({ ...draft, skills: next });
                      }}
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                    >
                      <option value="web">A. Développement web</option>
                      <option value="multimedia">B. Multimédia</option>
                      <option value="tools">C. Outils</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <Field
                      label="Nom (FR)"
                      value={skill.nameFr}
                      onChange={(v) => {
                        const next = [...draft.skills];
                        next[idx] = { ...skill, nameFr: v };
                        setDraft({ ...draft, skills: next });
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Niveau (0–100%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Non défini"
                      value={skill.level ?? ''}
                      onChange={(e) => {
                        const next = [...draft.skills];
                        const raw = e.target.value;
                        next[idx] = {
                          ...skill,
                          level: raw === '' ? null : Math.max(0, Math.min(100, Number(raw))),
                        };
                        setDraft({ ...draft, skills: next });
                      }}
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      label="Libellé (ex: Intermédiaire)"
                      value={skill.levelLabelFr}
                      onChange={(v) => {
                        const next = [...draft.skills];
                        next[idx] = { ...skill, levelLabelFr: v };
                        setDraft({ ...draft, skills: next });
                      }}
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      aria-label="Supprimer compétence"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          skills: draft.skills.filter((s) => s.id !== skill.id),
                        })
                      }
                      className="rounded-md p-2 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => saveSection('skills', draft.skills, 'Compétences enregistrées.')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D6B572]"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer les compétences</span>
            </button>
          </section>
        )}

        {/* ONGLET 5 : PROJETS */}
        {activeTab === 'projects' && (
          <section className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                Gestion du portfolio projets
              </h2>
              <button
                type="button"
                onClick={() => {
                  const proj: ProjectItem = {
                    id: `proj-${Date.now()}`,
                    title: 'NOUVEAU PROJET',
                    category: 'personal',
                    status: 'in_progress',
                    descriptionFr: 'Description du projet...',
                    descriptionEn: 'Project description...',
                    technologies: ['React', 'TypeScript'],
                    imageUrl: '',
                    liveUrl: '',
                    githubUrl: '',
                  };
                  setDraft({ ...draft, projects: [...draft.projects, proj] });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8A45D] px-3 py-1.5 text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter un projet</span>
              </button>
            </div>

            <div className="space-y-5">
              {draft.projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="space-y-4 rounded-lg border border-zinc-200 p-5 dark:border-white/10"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Nom du projet"
                      value={proj.title}
                      onChange={(v) => {
                        const next = [...draft.projects];
                        next[idx] = { ...proj, title: v };
                        setDraft({ ...draft, projects: next });
                      }}
                    />
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Catégorie
                      </label>
                      <select
                        value={proj.category}
                        onChange={(e) => {
                          const next = [...draft.projects];
                          next[idx] = {
                            ...proj,
                            category: e.target.value as ProjectCategory,
                          };
                          setDraft({ ...draft, projects: next });
                        }}
                        className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                      >
                        <option value="ecommerce">E-Commerce</option>
                        <option value="events">Événementiel</option>
                        <option value="personal">Mes projets personnels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        État réel d'avancement
                      </label>
                      <select
                        value={proj.status}
                        onChange={(e) => {
                          const next = [...draft.projects];
                          next[idx] = { ...proj, status: e.target.value as ProjectStatus };
                          setDraft({ ...draft, projects: next });
                        }}
                        className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                      >
                        <option value="concept">Concept</option>
                        <option value="in_progress">En développement</option>
                        <option value="completed">Réalisation terminée</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Description (FR)
                    </label>
                    <textarea
                      rows={2}
                      value={proj.descriptionFr}
                      onChange={(e) => {
                        const next = [...draft.projects];
                        next[idx] = { ...proj, descriptionFr: e.target.value };
                        setDraft({ ...draft, projects: next });
                      }}
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Technologies (séparées par virgule)"
                      value={proj.technologies.join(', ')}
                      onChange={(v) => {
                        const next = [...draft.projects];
                        next[idx] = {
                          ...proj,
                          technologies: v
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        setDraft({ ...draft, projects: next });
                      }}
                    />
                    <Field
                      label="Lien Voir le projet (URL)"
                      value={proj.liveUrl}
                      onChange={(v) => {
                        const next = [...draft.projects];
                        next[idx] = { ...proj, liveUrl: v };
                        setDraft({ ...draft, projects: next });
                      }}
                    />
                    <Field
                      label="Lien GitHub (URL)"
                      value={proj.githubUrl}
                      onChange={(v) => {
                        const next = [...draft.projects];
                        next[idx] = { ...proj, githubUrl: v };
                        setDraft({ ...draft, projects: next });
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-white/15">
                      <Upload className="h-3.5 w-3.5 text-[#C8A45D]" />
                      <span>Changer l'image de présentation</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const url = await uploadBinaryFile(f);
                            const next = [...draft.projects];
                            next[idx] = { ...proj, imageUrl: url };
                            setDraft({ ...draft, projects: next });
                            showNotice('ok', 'Image projet téléversée. Pensez à enregistrer.');
                          } catch (err) {
                            showNotice(
                              'err',
                              err instanceof Error ? err.message : 'Erreur import image'
                            );
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.filter((p) => p.id !== proj.id),
                        })
                      }
                      className="text-xs font-medium text-rose-500 hover:underline"
                    >
                      Supprimer le projet
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => saveSection('projects', draft.projects, 'Projets enregistrés.')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#D6B572]"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer les projets</span>
            </button>
          </section>
        )}

        {/* ONGLET 6 : EXPÉRIENCES & LANGUES */}
        {activeTab === 'experience' && (
          <section className="mt-8 space-y-8">
            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                  Expériences professionnelles
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const item: ExperienceItem = {
                      id: `exp-${Date.now()}`,
                      roleFr: 'Nouveau poste',
                      roleEn: 'New role',
                      companyOrSectorFr: 'Entreprise / Secteur',
                      companyOrSectorEn: 'Company / Sector',
                      location: 'Casablanca, Maroc',
                      period: '2026',
                      missionsFr: ['Mission principale'],
                      missionsEn: ['Main responsibility'],
                      highlightsFr: ['Organisation'],
                      highlightsEn: ['Organization'],
                    };
                    setDraft({ ...draft, experiences: [item, ...draft.experiences] });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8A45D] px-3 py-1.5 text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter une expérience</span>
                </button>
              </div>

              {draft.experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-white/10"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field
                      label="Intitulé du poste (FR)"
                      value={exp.roleFr}
                      onChange={(v) => {
                        const next = [...draft.experiences];
                        next[idx] = { ...exp, roleFr: v };
                        setDraft({ ...draft, experiences: next });
                      }}
                    />
                    <Field
                      label="Entreprise / Secteur"
                      value={exp.companyOrSectorFr}
                      onChange={(v) => {
                        const next = [...draft.experiences];
                        next[idx] = { ...exp, companyOrSectorFr: v };
                        setDraft({ ...draft, experiences: next });
                      }}
                    />
                    <Field
                      label="Période"
                      value={exp.period}
                      onChange={(v) => {
                        const next = [...draft.experiences];
                        next[idx] = { ...exp, period: v };
                        setDraft({ ...draft, experiences: next });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Missions (une par ligne)
                    </label>
                    <textarea
                      rows={3}
                      value={exp.missionsFr.join('\n')}
                      onChange={(e) => {
                        const next = [...draft.experiences];
                        next[idx] = { ...exp, missionsFr: e.target.value.split('\n') };
                        setDraft({ ...draft, experiences: next });
                      }}
                      className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                    />
                  </div>
                  <Field
                    label="Qualités mises en valeur (séparées par virgule)"
                    value={exp.highlightsFr.join(', ')}
                    onChange={(v) => {
                      const next = [...draft.experiences];
                      next[idx] = {
                        ...exp,
                        highlightsFr: v
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      };
                      setDraft({ ...draft, experiences: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        experiences: draft.experiences.filter((x) => x.id !== exp.id),
                      })
                    }
                    className="text-xs font-medium text-rose-500 hover:underline"
                  >
                    Supprimer cette expérience
                  </button>
                </div>
              ))}

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  saveSection('experiences', draft.experiences, 'Expériences enregistrées.')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D]"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer les expériences</span>
              </button>
            </div>

            <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                  Langues
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const langItem: LanguageItem = {
                      id: `lang-${Date.now()}`,
                      nameFr: 'Nouvelle langue',
                      nameEn: 'New language',
                      proficiencyFr: 'Notions',
                      proficiencyEn: 'Basic',
                    };
                    setDraft({ ...draft, languages: [...draft.languages, langItem] });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8A45D] px-3 py-1.5 text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter une langue</span>
                </button>
              </div>

              <div className="space-y-3">
                {draft.languages.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 items-end gap-3 sm:grid-cols-11"
                  >
                    <div className="sm:col-span-5">
                      <Field
                        label="Langue (FR)"
                        value={item.nameFr}
                        onChange={(v) => {
                          const next = [...draft.languages];
                          next[idx] = { ...item, nameFr: v };
                          setDraft({ ...draft, languages: next });
                        }}
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <Field
                        label="Niveau (FR)"
                        value={item.proficiencyFr}
                        onChange={(v) => {
                          const next = [...draft.languages];
                          next[idx] = { ...item, proficiencyFr: v };
                          setDraft({ ...draft, languages: next });
                        }}
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            languages: draft.languages.filter((l) => l.id !== item.id),
                          })
                        }
                        className="rounded-md p-2 text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => saveSection('languages', draft.languages, 'Langues enregistrées.')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D]"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer les langues</span>
              </button>
            </div>
          </section>
        )}

        {/* ONGLET 7 : OBJECTIFS & CENTRES D'INTÉRÊT */}
        {activeTab === 'objectives' && (
          <section className="mt-8 space-y-8">
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
              <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                Objectifs professionnels
              </h2>
              <Field
                label="Titre de section (FR)"
                value={draft.objectives.sectionTitleFr}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    objectives: { ...draft.objectives, sectionTitleFr: v },
                  })
                }
              />
              <Field
                label="Citation inspirante (FR)"
                value={draft.objectives.quoteFr}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    objectives: { ...draft.objectives, quoteFr: v },
                  })
                }
              />
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Ambitions (une par ligne)
                </label>
                <textarea
                  rows={6}
                  value={draft.objectives.itemsFr.join('\n')}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      objectives: {
                        ...draft.objectives,
                        itemsFr: e.target.value.split('\n'),
                      },
                    })
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                />
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  saveSection('objectives', draft.objectives, 'Objectifs enregistrés.')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D]"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer les objectifs</span>
              </button>
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                  Centres d'intérêt
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const item: InterestItem = {
                      id: `int-${Date.now()}`,
                      labelFr: 'Nouveau centre d’intérêt',
                      labelEn: 'New interest',
                      iconKey: 'globe',
                    };
                    setDraft({ ...draft, interests: [...draft.interests, item] });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#C8A45D] px-3 py-1.5 text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>
              <div className="space-y-3">
                {draft.interests.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.labelFr}
                      onChange={(e) => {
                        const next = [...draft.interests];
                        next[idx] = { ...item, labelFr: e.target.value };
                        setDraft({ ...draft, interests: next });
                      }}
                      className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          interests: draft.interests.filter((x) => x.id !== item.id),
                        })
                      }
                      className="rounded-md p-2 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  saveSection('interests', draft.interests, 'Centres d’intérêt enregistrés.')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D]"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer les centres d'intérêt</span>
              </button>
            </div>
          </section>
        )}

        {/* ONGLET 8 : MESSAGES REÇUS */}
        {activeTab === 'messages' && (
          <section className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-[#141418]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
                  Boîte de réception ({messages.length})
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {emailServiceConfigured
                    ? 'L’envoi d’e-mails via Resend est actif : les messages arrivent ici et dans votre boîte Gmail.'
                    : 'Messages enregistrés dans la boîte sécurisée du site. Ajoutez RESEND_API_KEY dans les secrets serveur pour recevoir aussi une copie par e-mail.'}
                </p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <Inbox className="mx-auto mb-3 h-8 w-8 text-[#C8A45D]" />
                Aucun message reçu pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <article
                    key={msg.id}
                    className={`rounded-lg border p-5 ${
                      msg.read
                        ? 'border-zinc-200 bg-[#FAFAFA] dark:border-white/10 dark:bg-[#0B0B0D]'
                        : 'border-[#C8A45D]/60 bg-white dark:bg-[#0B0B0D]'
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-[#0B0B0D] dark:text-white">
                        {msg.subject}
                      </h3>
                      <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(msg.createdAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      De : <span className="font-semibold">{msg.fullName}</span> ·{' '}
                      <a href={`mailto:${msg.email}`} className="text-[#C8A45D] hover:underline">
                        {msg.email}
                      </a>{' '}
                      · {msg.emailDispatched ? 'Copie e-mail envoyée' : 'Boîte interne'}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {msg.message}
                    </p>
                    <div className="mt-4 flex items-center gap-4 border-t border-zinc-200 pt-3 text-xs dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => handleToggleMessageRead(msg)}
                        className="inline-flex items-center gap-1 font-medium text-[#9A7B38] hover:underline dark:text-[#C8A45D]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{msg.read ? 'Marquer comme non lu' : 'Marquer comme lu'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="inline-flex items-center gap-1 font-medium text-rose-500 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm text-[#0B0B0D] outline-none transition-colors focus:border-[#C8A45D] dark:border-white/15 dark:bg-[#0B0B0D] dark:text-white"
      />
    </div>
  );
}
