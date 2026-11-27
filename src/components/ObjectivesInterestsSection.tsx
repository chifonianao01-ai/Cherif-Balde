import { Activity, BookOpen, Camera, Code2, Compass, Cpu, Globe, Plane } from 'lucide-react';
import type { InterestItem, LanguageCode, ObjectivesData } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface ObjectivesInterestsSectionProps {
  objectives: ObjectivesData;
  interests: InterestItem[];
  lang: LanguageCode;
}

function InterestIcon({ iconKey }: { iconKey: InterestItem['iconKey'] }) {
  const cls = 'h-5 w-5 text-[#C8A45D]';
  switch (iconKey) {
    case 'cpu':
      return <Cpu className={cls} />;
    case 'compass':
      return <Compass className={cls} />;
    case 'activity':
      return <Activity className={cls} />;
    case 'plane':
      return <Plane className={cls} />;
    case 'book':
      return <BookOpen className={cls} />;
    case 'camera':
      return <Camera className={cls} />;
    case 'code':
      return <Code2 className={cls} />;
    default:
      return <Globe className={cls} />;
  }
}

export function ObjectivesInterestsSection({
  objectives,
  interests,
  lang,
}: ObjectivesInterestsSectionProps) {
  const t = UI_TEXT[lang];
  const objItems = lang === 'fr' ? objectives.itemsFr : objectives.itemsEn;

  return (
    <>
      {/* PAGE 8 : OBJECTIFS PROFESSIONNELS */}
      <section
        id="objectifs"
        className="border-b border-zinc-200 bg-white py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
              07. {t.objectives.kicker}
            </p>
            <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
              {lang === 'fr' ? objectives.sectionTitleFr : objectives.sectionTitleEn}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {objItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 bg-[#FAFAFA] p-6 dark:border-white/10 dark:bg-[#141418]"
              >
                <span className="font-mono-tabular text-xs font-semibold text-[#9A7B38] dark:text-[#C8A45D]">
                  0{idx + 1}
                </span>
                <p className="mt-2.5 text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <blockquote className="mt-10 rounded-xl border border-[#C8A45D]/35 bg-[#FAFAFA] p-8 text-center dark:bg-[#141418]">
            <p className="font-display text-2xl font-medium italic text-[#0B0B0D] sm:text-3xl dark:text-white">
              « {lang === 'fr' ? objectives.quoteFr : objectives.quoteEn} »
            </p>
          </blockquote>
        </div>
      </section>

      {/* PAGE 9 : CENTRES D'INTÉRÊT */}
      <section
        id="centres-interet"
        className="border-b border-zinc-200 bg-[#FAFAFA] py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
              08. {t.interests.kicker}
            </p>
            <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
              {t.interests.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-colors duration-150 hover:border-[#C8A45D]/50 dark:border-white/10 dark:bg-[#141418]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-[#FAFAFA] dark:border-white/10 dark:bg-[#0B0B0D]">
                  <InterestIcon iconKey={interest.iconKey} />
                </div>
                <span className="text-sm font-semibold text-[#0B0B0D] dark:text-white">
                  {lang === 'fr' ? interest.labelFr : interest.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
