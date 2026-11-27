import { ArrowLeft } from 'lucide-react';
import type { LanguageCode } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface NotFoundPageProps {
  lang: LanguageCode;
  onNavigate: (path: string, sectionId?: string) => void;
}

export function NotFoundPage({ lang, onNavigate }: NotFoundPageProps) {
  const t = UI_TEXT[lang];

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[#FAFAFA] px-5 py-20 dark:bg-[#0B0B0D]">
      <div className="max-w-md text-center">
        <p className="font-mono-tabular text-sm font-semibold text-[#C8A45D]">
          {t.notFound.code}
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-[#0B0B0D] sm:text-5xl dark:text-white">
          {t.notFound.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t.notFound.desc}
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/', 'accueil')}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.notFound.backHome}</span>
        </button>
      </div>
    </main>
  );
}
