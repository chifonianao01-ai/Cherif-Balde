import type { LanguageCode, LanguageItem } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface LanguagesSectionProps {
  languages: LanguageItem[];
  lang: LanguageCode;
}

export function LanguagesSection({ languages, lang }: LanguagesSectionProps) {
  const t = UI_TEXT[lang];

  return (
    <section
      id="langues"
      className="border-b border-zinc-200 bg-[#FAFAFA] py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
            06. {t.languages.kicker}
          </p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
            {t.languages.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors duration-150 hover:border-[#C8A45D]/60 dark:border-white/10 dark:bg-[#141418]"
            >
              <h3 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                {lang === 'fr' ? item.nameFr : item.nameEn}
              </h3>
              <p className="mt-2 text-sm font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                {lang === 'fr' ? item.proficiencyFr : item.proficiencyEn}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
