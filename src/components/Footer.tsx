import { ArrowUp, Lock } from 'lucide-react';
import type { LanguageCode, ProfileData } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface FooterProps {
  profile: ProfileData;
  lang: LanguageCode;
  onNavigate: (path: string, sectionId?: string) => void;
}

export function Footer({ profile, lang, onNavigate }: FooterProps) {
  const t = UI_TEXT[lang];
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-200 bg-white py-10 dark:border-white/10 dark:bg-[#0B0B0D]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="font-display text-lg font-semibold text-[#0B0B0D] dark:text-white">
            {profile.fullName}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            © {year} {profile.fullName} · {t.footer.rights}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/admin');
            }}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#9A7B38] dark:hover:text-[#C8A45D]"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{t.footer.adminLink}</span>
          </a>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-700 transition-colors hover:border-[#C8A45D] dark:border-white/15 dark:text-zinc-200"
          >
            <ArrowUp className="h-3.5 w-3.5 text-[#C8A45D]" />
            <span>{t.footer.backToTop}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
