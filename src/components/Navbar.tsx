import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { LanguageCode } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface NavbarProps {
  brandName: string;
  lang: LanguageCode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onNavigate: (path: string, sectionId?: string) => void;
  onDownloadCv: () => void;
}

export function Navbar({
  brandName,
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
  onNavigate,
  onDownloadCv,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = UI_TEXT[lang];

  const primaryLinks = [
    { label: t.nav.about, path: '/a-propos', id: 'a-propos' },
    { label: t.nav.education, path: '/parcours', id: 'parcours' },
    { label: t.nav.projects, path: '/projets', id: 'projets' },
    { label: t.nav.gallery, path: '/galerie', id: 'galerie' },
    { label: t.nav.contact, path: '/contact', id: 'contact' },
  ];

  const allMobileLinks = [
    ...primaryLinks.slice(0, 2),
    { label: t.nav.skills, path: '/competences', id: 'competences' },
    { label: t.nav.projects, path: '/projets', id: 'projets' },
    { label: t.nav.experiences, path: '/experiences', id: 'experiences' },
    { label: t.nav.languages, path: '/langues', id: 'langues' },
    { label: t.nav.objectives, path: '/objectifs', id: 'objectifs' },
    { label: t.nav.interests, path: '/centres-interet', id: 'centres-interet' },
    { label: t.nav.gallery, path: '/galerie', id: 'galerie' },
    { label: t.nav.contact, path: '/contact', id: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[#FAFAFA]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0B0D]/90">
      {/* Strict 3-zone Top Bar Contract */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-5 py-4 sm:px-8">
        {/* Zone 1 : Wordmark seul */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/', 'accueil');
            setMobileOpen(false);
          }}
          className="font-display text-xl font-semibold tracking-tight text-[#0B0B0D] whitespace-nowrap shrink-0 dark:text-white"
        >
          {brandName.toUpperCase()}
        </a>

        {/* Zone 2 : 5 liens de navigation épurés sur une ligne */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300"
        >
          {primaryLinks.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.path, item.id);
              }}
              className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#0B0B0D] hover:underline hover:decoration-[#C8A45D] hover:underline-offset-8 dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3 : 1 action principale (et bouton menu sur mobile) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onDownloadCv}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#0B0B0D] transition-colors duration-150 hover:bg-[#D6B572] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8A45D]"
          >
            {t.nav.downloadCv}
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 md:hidden dark:border-white/15 dark:text-zinc-200"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu responsive mobile */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-[#FAFAFA] px-5 py-5 md:hidden dark:border-white/10 dark:bg-[#0B0B0D]">
          <nav className="grid grid-cols-2 gap-3 text-sm">
            {allMobileLinks.map((item) => (
              <a
                key={item.id}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path, item.id);
                  setMobileOpen(false);
                }}
                className="rounded-md px-3 py-2 font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                onDownloadCv();
                setMobileOpen(false);
              }}
              className="rounded-lg bg-[#C8A45D] px-4 py-2.5 text-xs font-semibold text-[#0B0B0D]"
            >
              {t.nav.downloadCv}
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 dark:border-white/15 dark:text-zinc-200"
            >
              {theme === 'dark' ? t.hero.lightMode : t.hero.darkMode}
            </button>
            <button
              type="button"
              onClick={onToggleLang}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 dark:border-white/15 dark:text-zinc-200"
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin');
                setMobileOpen(false);
              }}
              className="ml-auto text-xs font-medium text-[#9A7B38] dark:text-[#C8A45D]"
            >
              {t.nav.admin}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
