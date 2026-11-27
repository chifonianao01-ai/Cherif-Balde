import { useState } from 'react';
import { Upload } from 'lucide-react';
import type { GalleryPhoto, LanguageCode, ProfileData } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface AboutSectionProps {
  profile: ProfileData;
  aboutPhoto: GalleryPhoto | null;
  lang: LanguageCode;
  onNavigate: (path: string, sectionId?: string) => void;
}

export function AboutSection({
  profile,
  aboutPhoto,
  lang,
  onNavigate,
}: AboutSectionProps) {
  const [imgError, setImgError] = useState(false);
  const t = UI_TEXT[lang];
  const paragraphs = lang === 'fr' ? profile.aboutStoryFr : profile.aboutStoryEn;

  return (
    <section
      id="a-propos"
      className="border-b border-zinc-200 bg-white py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
            01. {t.about.kicker}
          </p>
          <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
            {t.about.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Photographie À propos (uniquement photo réelle fournie par Cherif) */}
          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[340px] overflow-hidden rounded-xl border border-zinc-200 bg-[#F4F4F5] dark:border-white/10 dark:bg-[#141418]">
              {aboutPhoto && !imgError ? (
                <img
                  src={aboutPhoto.url}
                  alt={
                    (lang === 'fr' ? aboutPhoto.captionFr : aboutPhoto.captionEn) ||
                    profile.fullName
                  }
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover lg:absolute lg:inset-0"
                />
              ) : (
                <div className="flex h-full min-h-[340px] flex-col items-center justify-center p-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[#C8A45D]/40 bg-[#0B0B0D] text-[#C8A45D]">
                    <span className="font-display text-2xl font-semibold">CB</span>
                  </div>
                  <p className="mt-4 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
                    {t.about.photoPlaceholder}
                  </p>
                  <a
                    href="/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/admin');
                    }}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#9A7B38] hover:underline dark:text-[#C8A45D]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{t.hero.goToAdminPhoto}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Histoire personnelle et professionnelle */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div className="space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t border-zinc-200 pt-6 sm:grid-cols-3 dark:border-white/10">
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.about.originLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0B0B0D] dark:text-white">
                  {t.about.originValue}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.about.residenceLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0B0B0D] dark:text-white">
                  {lang === 'fr' ? profile.locationFr : profile.locationEn}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.about.statusLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#9A7B38] dark:text-[#C8A45D]">
                  {lang === 'fr' ? profile.availabilityFr : profile.availabilityEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
