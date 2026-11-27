-- ============================================================================
-- SCHÉMA SUPABASE (PostgreSQL + Auth + Storage) — PORTFOLIO CHERIF BALDE
-- À exécuter dans Supabase -> SQL Editor lors d'un déploiement sur Supabase
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Profil principal & textes du site
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'Cherif BALDE',
  title_fr text not null,
  title_en text not null,
  tagline_fr text not null,
  tagline_en text not null,
  hero_summary_fr text not null,
  hero_summary_en text not null,
  about_story_fr jsonb not null default '[]'::jsonb,
  about_story_en jsonb not null default '[]'::jsonb,
  location_fr text not null,
  location_en text not null,
  availability_fr text not null,
  availability_en text not null,
  email text not null,
  phone text,
  website_url text,
  cv_pdf_url text,
  hero_photo_id uuid,
  about_photo_id uuid,
  social jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Parcours académique & certificats
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  period text not null,
  title_fr text not null,
  title_en text not null,
  institution text not null,
  location text not null,
  status text not null check (status in ('validated', 'envisaged')),
  description_fr text,
  description_en text,
  certificate_url text,
  certificate_name text,
  sort_order int not null default 0
);

-- 3. Compétences (niveau nullable pour ne pas inventer d'expertise)
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('web', 'multimedia', 'tools')),
  name_fr text not null,
  name_en text not null,
  level int check (level >= 0 and level <= 100),
  level_label_fr text,
  level_label_en text,
  sort_order int not null default 0
);

-- 4. Projets
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('ecommerce', 'events', 'personal')),
  status text not null check (status in ('concept', 'in_progress', 'completed')),
  description_fr text not null,
  description_en text not null,
  technologies text[] not null default '{}',
  image_url text,
  live_url text,
  github_url text,
  sort_order int not null default 0
);

-- 5. Expériences professionnelles
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role_fr text not null,
  role_en text not null,
  company_or_sector_fr text not null,
  company_or_sector_en text not null,
  location text not null,
  period text not null,
  missions_fr jsonb not null default '[]'::jsonb,
  missions_en jsonb not null default '[]'::jsonb,
  highlights_fr jsonb not null default '[]'::jsonb,
  highlights_en jsonb not null default '[]'::jsonb,
  sort_order int not null default 0
);

-- 6. Langues
create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  name_fr text not null,
  name_en text not null,
  proficiency_fr text not null,
  proficiency_en text not null,
  sort_order int not null default 0
);

-- 7. Galerie photographique
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption_fr text,
  caption_en text,
  category text not null check (category in ('portrait', 'attire', 'workspace', 'presentation', 'events', 'other')),
  uploaded_at timestamptz not null default now()
);

-- 8. Messages de contact (lecture/suppression réservées à l'admin)
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Activation du Row Level Security (RLS)
alter table public.profile enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.languages enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.contact_messages enable row level security;

-- Lecture publique du portfolio
create policy "Public read profile" on public.profile for select using (true);
create policy "Public read education" on public.education for select using (true);
create policy "Public read skills" on public.skills for select using (true);
create policy "Public read projects" on public.projects for select using (true);
create policy "Public read experiences" on public.experiences for select using (true);
create policy "Public read languages" on public.languages for select using (true);
create policy "Public read gallery" on public.gallery_photos for select using (true);

-- Insertion publique uniquement pour le formulaire de contact
create policy "Public insert contact_messages" on public.contact_messages
  for insert with check (true);

-- Modification complète réservée à l'administrateur authentifié (remplacer par votre email admin)
create policy "Admin full access profile" on public.profile for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin full access education" on public.education for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin full access skills" on public.skills for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin full access projects" on public.projects for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin full access experiences" on public.experiences for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin full access languages" on public.languages for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin full access gallery" on public.gallery_photos for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');
create policy "Admin read/delete messages" on public.contact_messages for all
  using (auth.jwt() ->> 'email' = 'baldecherifnianao01@gmail.com');

-- Storage Buckets (à créer dans Supabase Storage) :
-- 1) portfolio-media (public read, admin write) pour photos & images projets
-- 2) portfolio-documents (public read, admin write) pour CV PDF et attestations
