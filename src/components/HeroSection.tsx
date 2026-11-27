import { useState } from 'react';
import { ArrowDownRight, Check, Download, Globe, Mail, Moon, Share2, Sun, Upload } from 'lucide-react';
import type { GalleryPhoto, LanguageCode, ProfileData } from '../types/portfolio';
import { UI_TEXT } from '../i18n/translations';

interface HeroSectionProps {
  profile: ProfileData;
  heroPhoto: GalleryPhoto | null;
  lang: LanguageCode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onNavigate: (path: string, sectionId?: string) => void;
  onDownloadCv: () => void;
}

export function HeroSection({
  profile,
  heroPhoto,
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
  onNavigate,
  onDownloadCv,
}: HeroSectionProps) {
  const [sharedCopied, setSharedCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const t = UI_TEXT[lang];

  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareData = {
      title: `${profile.fullName} — ${lang === 'fr' ? profile.titleFr : profile.titleEn}`,
      text: lang === 'fr' ? profile.taglineFr : profile.taglineEn,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback vers la copie dans le presse-papier
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setSharedCopied(true);
      setTimeout(() => setSharedCopied(false), 2600);
    } catch {
      // Silencieux si le navigateur bloque le presse-papier
    }
  };

  return (
    <section
      id="accueil"
      className="relative overflow-hidden border-b border-zinc-200 dark:border-white/10"
    >
      {/* Arrière-plan architectural discret et moderne */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-55"
        style={{
          backgroundImage:
            'radial-gradient(circle at 82% 24%, rgba(200, 164, 93, 0.14), transparent 44%), radial-gradient(circle at 14% 78%, rgba(200, 164, 93, 0.08), transparent 40%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-12">
        {/* Barre utilitaire discrète (Thème, Langue, Partage) */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-4 text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>{lang === 'fr' ? profile.locationFr : profile.locationEn}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'fr' ? profile.availabilityFr : profile.availabilityEn}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white/80 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:border-[#C8A45D] hover:text-[#0B0B0D] whitespace-nowrap dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:text-white"
            >
              {sharedCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#C8A45D]" />
                  <span>{t.hero.copiedLink}</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#C8A45D]" />
                  <span>{t.hero.sharePortfolio}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onToggleLang}
              aria-label="Changer de langue"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white/80 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:border-[#C8A45D] whitespace-nowrap dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
            >
              <Globe className="h-3.5 w-3.5 text-[#C8A45D]" />
              <span>{lang === 'fr' ? 'FR / EN' : 'EN / FR'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t.hero.lightMode : t.hero.darkMode}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white/80 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:border-[#C8A45D] whitespace-nowrap dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-[#C8A45D]" />
                  <span>{t.hero.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-[#9A7B38]" />
                  <span>{t.hero.darkMode}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grille Hero Split à hauteur équilibrée */}
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-sm font-semibold tracking-wide text-[#9A7B38] dark:text-[#C8A45D]">
              {lang === 'fr' ? profile.titleFr : profile.titleEn}
            </p>

            <h1 className="font-display mt-3 text-balance text-5xl font-semibold tracking-tight text-[#0B0B0D] sm:text-6xl lg:text-7xl dark:text-white">
              {profile.fullName}
            </h1>

            <p className="mt-6 max-w-2xl text-xl font-medium leading-relaxed text-zinc-800 sm:text-2xl dark:text-zinc-100">
              « {lang === 'fr' ? profile.taglineFr : profile.taglineEn} »
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {lang === 'fr' ? profile.heroSummaryFr : profile.heroSummaryEn}
            </p>

            {/* Boutons d'action */}
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <a
                href="/parcours"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/parcours', 'parcours');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors duration-150 hover:bg-[#D6B572] whitespace-nowrap"
              >
                <span>{t.hero.ctaJourney}</span>
                <ArrowDownRight className="h-4 w-4" />
              </a>

              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/contact', 'contact');
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-[#0B0B0D] transition-colors duration-150 hover:border-[#C8A45D] whitespace-nowrap dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-[#C8A45D]"
              >
                <Mail className="h-4 w-4 text-[#C8A45D]" />
                <span>{t.hero.ctaContact}</span>
              </a>

              <button
                type="button"
                onClick={onDownloadCv}
                className="inline-flex items-center gap-2 rounded-lg border border-transparent px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors duration-150 hover:text-[#9A7B38] whitespace-nowrap dark:text-zinc-300 dark:hover:text-[#C8A45D]"
              >
                <Download className="h-4 w-4" />
                <span>{t.hero.ctaCv}</span>
              </button>
            </div>
          </div>

          {/* Emplacement de la grande photographie professionnelle réelle (jamais générée par IA) */}
          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[380px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-[#141418]">
              {heroPhoto && !imgError ? (
                <>
                  <img
                    src={heroPhoto.url}
                    alt={
                      (lang === 'fr' ? heroPhoto.captionFr : heroPhoto.captionEn) ||
                      profile.fullName
                    }
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover lg:absolute lg:inset-0"
                  />
                  {(heroPhoto.captionFr || heroPhoto.captionEn) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 text-white">
                      <p className="text-xs font-medium text-zinc-200">
                        {lang === 'fr' ? heroPhoto.captionFr : heroPhoto.captionEn}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full min-h-[380px] flex-col items-center justify-between p-8 text-center">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {profile.websiteUrl.replace(/^https?:\/\//, '')}
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#C8A45D]/45 bg-[#0B0B0D] text-[#C8A45D] shadow-sm">
                      <span className="font-display text-4xl font-semibold tracking-wider">
                        CB
                      </span>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-[#0B0B0D] dark:text-white">
                      {t.hero.photoPlaceholderTitle}
                    </p>
                    <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {t.hero.photoPlaceholderDesc}
                    </p>
                  </div>
                  <a
                    href="/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('/admin');
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#C8A45D]/40 px-4 py-2 text-xs font-semibold text-[#9A7B38] transition-colors hover:bg-[#C8A45D]/10 dark:text-[#C8A45D]"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{t.hero.goToAdminPhoto}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
