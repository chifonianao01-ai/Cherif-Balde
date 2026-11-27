import { CheckCircle2 } from 'lucide-react';
import type { ExperienceItem, LanguageCode } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface ExperienceSectionProps {
  experiences: ExperienceItem[];
  lang: LanguageCode;
}

export function ExperienceSection({ experiences, lang }: ExperienceSectionProps) {
  const t = UI_TEXT[lang];

  return (
    <section
      id="experiences"
      className="border-b border-zinc-200 bg-white py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
            05. {t.experiences.kicker}
          </p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
            {t.experiences.heading}
          </h2>
        </div>

        <div className="space-y-8">
          {experiences.map((exp) => {
            const missions = lang === 'fr' ? exp.missionsFr : exp.missionsEn;
            const highlights = lang === 'fr' ? exp.highlightsFr : exp.highlightsEn;

            return (
              <article
                key={exp.id}
                className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-6 sm:p-8 dark:border-white/10 dark:bg-[#141418]"
              >
                <div className="flex flex-col justify-between gap-2 border-b border-zinc-200 pb-5 sm:flex-row sm:items-baseline dark:border-white/10">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0B0B0D] dark:text-white">
                      {lang === 'fr' ? exp.roleFr : exp.roleEn}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      {lang === 'fr' ? exp.companyOrSectorFr : exp.companyOrSectorEn} · {exp.location}
                    </p>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]">
                    {exp.period}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <h4 className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t.experiences.missionsTitle}
                    </h4>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {missions.map((mission, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A45D]" />
                          <span>{mission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {highlights.length > 0 && (
                    <div className="lg:col-span-5">
                      <h4 className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                        {t.experiences.highlightsTitle}
                      </h4>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        {highlights.map((item, idx) => (
                          <div
                            key={idx}
                            className="border-b border-zinc-200/70 pb-1.5 text-sm font-medium text-zinc-800 last:border-b-0 dark:border-white/10 dark:text-zinc-200"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
