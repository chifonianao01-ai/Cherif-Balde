import type { LanguageCode, SkillCategory, SkillItem } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface SkillsSectionProps {
  skills: SkillItem[];
  lang: LanguageCode;
}

export function SkillsSection({ skills, lang }: SkillsSectionProps) {
  const t = UI_TEXT[lang];

  const categories: Array<{ key: SkillCategory; title: string }> = [
    { key: 'web', title: t.skills.catWeb },
    { key: 'multimedia', title: t.skills.catMultimedia },
    { key: 'tools', title: t.skills.catTools },
  ];

  return (
    <section
      id="competences"
      className="border-b border-zinc-200 bg-white py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
            03. {t.skills.kicker}
          </p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
            {t.skills.heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t.skills.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {categories.map((cat) => {
            const items = skills.filter((s) => s.category === cat.key);
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-6 dark:border-white/10 dark:bg-[#141418]"
              >
                <h3 className="border-b border-zinc-200 pb-3 text-base font-semibold text-[#0B0B0D] dark:border-white/10 dark:text-white">
                  {cat.title}
                </h3>

                <ul className="mt-5 space-y-4">
                  {items.map((skill) => {
                    const name = lang === 'fr' ? skill.nameFr : skill.nameEn;
                    const customLabel =
                      lang === 'fr' ? skill.levelLabelFr : skill.levelLabelEn;
                    const hasLevel = typeof skill.level === 'number';

                    return (
                      <li key={skill.id} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {name}
                          </span>
                          {hasLevel ? (
                            <span className="font-mono-tabular text-xs font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                              {customLabel ? `${customLabel} · ${skill.level}%` : `${skill.level}%`}
                            </span>
                          ) : customLabel ? (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {customLabel}
                            </span>
                          ) : null}
                        </div>

                        {hasLevel && (
                          <div
                            className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10"
                            role="progressbar"
                            aria-valuenow={skill.level ?? 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={name}
                          >
                            <div
                              className="h-full rounded-full bg-[#C8A45D] transition-transform duration-300"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
