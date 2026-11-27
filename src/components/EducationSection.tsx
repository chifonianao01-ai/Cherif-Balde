import { FileText } from 'lucide-react';
import type { EducationItem, LanguageCode } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface EducationSectionProps {
  education: EducationItem[];
  lang: LanguageCode;
}

export function EducationSection({ education, lang }: EducationSectionProps) {
  const t = UI_TEXT[lang];
  const validated = education.filter((e) => e.status === 'validated');
  const envisaged = education.filter((e) => e.status === 'envisaged');

  return (
    <section
      id="parcours"
      className="border-b border-zinc-200 bg-[#FAFAFA] py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
            02. {t.education.kicker}
          </p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
            {t.education.heading}
          </h2>
        </div>

        {/* Formations envisagées (distinguées clairement) */}
        {envisaged.length > 0 && (
          <div className="mb-12">
            <h3 className="mb-5 text-sm font-semibold text-[#9A7B38] dark:text-[#C8A45D]">
              {t.education.envisagedTitle}
            </h3>
            <div className="space-y-4">
              {envisaged.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-dashed border-[#C8A45D]/50 bg-white p-6 dark:bg-[#141418]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono-tabular font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                      {item.period}
                    </span>
                    <span>
                      {t.education.envisagedBadge} · {item.location}
                    </span>
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-[#0B0B0D] dark:text-white">
                    {lang === 'fr' ? item.titleFr : item.titleEn}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {item.institution}
                  </p>
                  {(item.descriptionFr || item.descriptionEn) && (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {lang === 'fr' ? item.descriptionFr : item.descriptionEn}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Diplômes obtenus & formations validées */}
        <div>
          <h3 className="mb-6 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {t.education.validatedTitle}
          </h3>

          <div className="relative space-y-6 border-l border-zinc-200 pl-6 sm:pl-8 dark:border-white/10">
            {validated.map((item) => (
              <article
                key={item.id}
                className="relative rounded-xl border border-zinc-200 bg-white p-6 transition-colors duration-150 hover:border-[#C8A45D]/50 dark:border-white/10 dark:bg-[#141418]"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-7 h-2.5 w-2.5 rounded-full border-2 border-[#C8A45D] bg-[#FAFAFA] sm:-left-[39px] dark:bg-[#0B0B0D]"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-mono-tabular font-semibold text-[#9A7B38] dark:text-[#C8A45D]">
                    {item.period}
                  </span>
                  <span>
                    {t.education.validatedBadge} · {item.location}
                  </span>
                </div>
                <h4 className="mt-2 text-lg font-semibold text-[#0B0B0D] dark:text-white">
                  {lang === 'fr' ? item.titleFr : item.titleEn}
                </h4>
                <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {item.institution}
                </p>
                {(item.descriptionFr || item.descriptionEn) && (
                  <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {lang === 'fr' ? item.descriptionFr : item.descriptionEn}
                  </p>
                )}

                {item.certificateUrl && (
                  <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-white/10">
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#9A7B38] hover:underline dark:text-[#C8A45D]"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>
                        {item.certificateName || t.education.viewCertificate}
                      </span>
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
