import { useEffect, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import type { GalleryPhoto, LanguageCode, PhotoCategory } from '../types/portfolio';
import { getPhotoCategoryLabel, UI_TEXT } from '../i18n/translations';

interface GallerySectionProps {
  gallery: GalleryPhoto[];
  heroPhotoId: string | null;
  aboutPhotoId: string | null;
  lang: LanguageCode;
  onNavigate: (path: string, sectionId?: string) => void;
}

const CATEGORIES: PhotoCategory[] = [
  'portrait',
  'attire',
  'workspace',
  'presentation',
  'events',
  'other',
];

export function GallerySection({
  gallery,
  heroPhotoId,
  aboutPhotoId,
  lang,
  onNavigate,
}: GallerySectionProps) {
  const [filter, setFilter] = useState<'all' | PhotoCategory>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const t = UI_TEXT[lang];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxPhoto(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered =
    filter === 'all' ? gallery : gallery.filter((p) => p.category === filter);

  return (
    <section
      id="galerie"
      className="border-b border-zinc-200 bg-white py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
              09. {t.gallery.kicker}
            </p>
            <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
              {t.gallery.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.gallery.subtitle}
            </p>
          </div>

          {gallery.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-[#FAFAFA] p-1 dark:border-white/10 dark:bg-[#141418]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === 'all'
                    ? 'bg-[#C8A45D] text-[#0B0B0D]'
                    : 'text-zinc-600 hover:text-[#0B0B0D] dark:text-zinc-300 dark:hover:text-white'
                }`}
              >
                {t.gallery.allPhotos}
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === cat
                      ? 'bg-[#C8A45D] text-[#0B0B0D]'
                      : 'text-zinc-600 hover:text-[#0B0B0D] dark:text-zinc-300 dark:hover:text-white'
                  }`}
                >
                  {getPhotoCategoryLabel(cat, lang)}
                </button>
              ))}
            </div>
          )}
        </div>

        {gallery.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-[#FAFAFA] p-12 text-center dark:border-white/15 dark:bg-[#141418]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#C8A45D]/40 bg-[#0B0B0D] text-[#C8A45D]">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#0B0B0D] dark:text-white">
              {t.gallery.emptyTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.gallery.emptyDesc}
            </p>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin');
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C8A45D] px-5 py-2.5 text-xs font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572]"
            >
              <Upload className="h-4 w-4" />
              <span>{t.gallery.openAdmin}</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((photo) => {
              const caption = lang === 'fr' ? photo.captionFr : photo.captionEn;
              const markers: string[] = [];
              if (photo.id === heroPhotoId) markers.push(t.gallery.heroMarker);
              if (photo.id === aboutPhotoId) markers.push(t.gallery.aboutMarker);

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="group overflow-hidden rounded-xl border border-zinc-200 bg-[#FAFAFA] text-left transition-colors hover:border-[#C8A45D]/60 dark:border-white/10 dark:bg-[#141418]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                    {!failed[photo.id] ? (
                      <img
                        src={photo.url}
                        alt={caption || getPhotoCategoryLabel(photo.category, lang)}
                        referrerPolicy="no-referrer"
                        onError={() => setFailed((prev) => ({ ...prev, [photo.id]: true }))}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                        {caption || 'Image'}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{getPhotoCategoryLabel(photo.category, lang)}</span>
                      {markers.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                            {markers.join(' · ')}
                          </span>
                        </>
                      )}
                    </div>
                    {caption && (
                      <p className="mt-1.5 text-sm font-medium text-[#0B0B0D] dark:text-white">
                        {caption}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox plein écran */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            type="button"
            aria-label="Fermer la photo"
            onClick={() => setLightboxPhoto(null)}
            className="absolute right-5 top-5 rounded-lg border border-white/20 bg-black/50 p-2.5 text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="max-h-[90vh] max-w-4xl overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.url}
              alt={
                (lang === 'fr' ? lightboxPhoto.captionFr : lightboxPhoto.captionEn) ||
                'Cherif Balde'
              }
              referrerPolicy="no-referrer"
              className="max-h-[78vh] w-auto rounded-lg object-contain mx-auto"
            />
            <p className="mt-3 text-sm text-zinc-200">
              {getPhotoCategoryLabel(lightboxPhoto.category, lang)}
              {(lang === 'fr' ? lightboxPhoto.captionFr : lightboxPhoto.captionEn)
                ? ` — ${lang === 'fr' ? lightboxPhoto.captionFr : lightboxPhoto.captionEn}`
                : ''}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
