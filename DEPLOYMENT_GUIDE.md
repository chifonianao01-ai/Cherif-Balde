# Guide complet d'installation, de configuration et de mise en ligne — Cherif Balde

Ce document explique étape par étape comment installer, comprendre, sécuriser, héberger et connecter le portfolio au nom de domaine **cherifbalde.com**.

---

## 1. Architecture des dossiers du projet

```text
├── index.html                  # Métadonnées SEO, OpenGraph, Schema.org, polices et favicon
├── server.ts                   # Serveur Express (API publique, /api/admin/*, uploads sécurisés, Vite)
├── server/
│   ├── auth.ts                 # Hachage scrypt, vérification Timing-Safe, jetons Bearer HMAC
│   ├── defaultData.ts          # Contenu initial complet (FR/EN) de Cherif Balde
│   ├── store.ts                # Persistance atomique côté serveur (data/portfolio-db.json)
│   └── types.ts                # Types TypeScript partagés
├── supabase/
│   └── schema.sql              # Schéma PostgreSQL + règles RLS si migration vers Supabase
├── public/
│   └── favicon.svg             # Favicon personnalisée « CB » or sur noir obsidienne
├── src/
│   ├── App.tsx                 # Routeur SPA (Accueil, sections, /admin, page 404)
│   ├── index.css               # Configuration Tailwind CSS v4 + mode sombre/clair
│   ├── i18n/translations.ts    # Dictionnaire bilingue Français / Anglais
│   ├── utils/generateCvPdf.ts  # Générateur de CV PDF téléchargeable (jsPDF)
│   └── components/             # Chaque section du portfolio + Tableau de bord Admin
└── .env.example                # Modèle des variables d'environnement (ne jamais commiter .env)
```

---

## 2. Commandes à exécuter dans le terminal VS Code

1. **Installer les dépendances** :
   ```bash
   npm install
   ```
2. **Créer le fichier `.env`** à partir de `.env.example` :
   ```bash
   cp .env.example .env
   ```
   Modifiez `.env` pour définir au minimum `ADMIN_PASSCODE` (votre mot de passe administrateur).
3. **Lancer le projet en développement** :
   ```bash
   npm run dev
   ```
   Le site sera accessible sur `http://localhost:3000` et le tableau de bord sur `http://localhost:3000/admin`.
4. **Compiler pour la production** :
   ```bash
   npm run build
   npm start
   ```

---

## 3. Configuration de l'envoi réel d'e-mails (Formulaire de contact)

Le formulaire de contact enregistre chaque message dans la boîte de réception du tableau de bord administrateur (`/admin`).
Pour recevoir également chaque message directement sur **baldecherifnianao01@gmail.com** :

1. Créez un compte gratuit sur [resend.com](https://resend.com).
2. Créez une clé API et ajoutez-la dans vos variables d'environnement :
   ```env
   RESEND_API_KEY="re_votre_cle_api"
   CONTACT_TO_EMAIL="baldecherifnianao01@gmail.com"
   CONTACT_FROM_EMAIL="Portfolio Cherif Balde <contact@cherifbalde.com>"
   ```
   *(Tant que votre domaine n'est pas vérifié sur Resend, vous pouvez utiliser `onboarding@resend.dev` pour vos tests.)*

---

## 4. Configuration de Supabase (si vous souhaitez migrer vers Supabase Cloud)

1. Créez un projet sur [supabase.com](https://supabase.com) (région EU West ou proche).
2. Ouvrez **SQL Editor** et exécutez le contenu du fichier `supabase/schema.sql`.
3. Dans **Authentication → Providers**, activez **Email** et créez votre compte administrateur (`baldecherifnianao01@gmail.com`).
4. Dans **Storage**, créez deux buckets publics : `portfolio-media` (photos & projets) et `portfolio-documents` (CV PDF & attestations).
5. Récupérez `Project URL` et `anon public key` dans **Project Settings → API** (ne jamais exposer la clé `service_role` dans le frontend).

---

## 5. Connexion à GitHub

Dans le terminal VS Code :

```bash
git init
git add .
git commit -m "Initialisation du portfolio professionnel de Cherif Balde"
git branch -M main
git remote add origin https://github.com/VOTRE_COMPTE_GITHUB/cherifbalde-portfolio.git
git push -u origin main
```

Vérifiez que `.env`, `data/` et `uploads/` restent bien ignorés dans `.gitignore` avant chaque `git push`.

---

## 6. Déploiement en ligne

> **Important :** Ce projet inclut un serveur Express (`server.ts`) qui gère la sauvegarde des données, l'authentification administrateur et le stockage de vos photos/PDF dans `data/` et `uploads/`.

- **Option recommandée pour ce serveur Node.js persistant** : Déployez sur **Railway**, **Render**, **Fly.io** ou un VPS Node.js avec un volume persistant monté sur `/app/data` et `/app/uploads`.
  - Commande de build : `npm run build`
  - Commande de démarrage : `npm start`
  - Variables d'environnement à renseigner : `NODE_ENV=production`, `ADMIN_PASSCODE`, `SESSION_SECRET`, `RESEND_API_KEY`, `APP_URL=https://cherifbalde.com`.
- **Option Vercel** : Si vous souhaitez utiliser Vercel uniquement en hébergement statique serverless, connectez votre dépôt GitHub sur [vercel.com](https://vercel.com), configurez Supabase (étape 4) pour la base de données/stockage persistant, puis cliquez sur **Deploy**.

---

## 7. Connexion du nom de domaine `cherifbalde.com`

1. Achetez le domaine `cherifbalde.com` chez votre registraire (Namecheap, OVH, Cloudflare, Hostinger, etc.).
2. Dans les paramètres de votre hébergeur (Vercel, Render ou Railway), ajoutez le domaine personnalisé `cherifbalde.com` et `www.cherifbalde.com`.
3. Dans la zone DNS de votre registraire, ajoutez les enregistrements indiqués par l'hébergeur :
   - Un enregistrement `A` pour `@` pointant vers l'adresse IP fournie (ou `76.76.21.21` pour Vercel).
   - Un enregistrement `CNAME` pour `www` pointant vers l'adresse cible fournie (ex. `cname.vercel-dns.com`).
4. Attendez la propagation DNS (15 min à 24 h) : le certificat HTTPS (SSL) s'activera automatiquement.
