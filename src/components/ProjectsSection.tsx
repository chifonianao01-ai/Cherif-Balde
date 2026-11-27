import { useState } from 'react';
import { ExternalLink, FolderGit2, X } from 'lucide-react';
import type { LanguageCode, ProjectCategory, ProjectItem } from '../types/portfolio';
import { getCategoryLabel, getStatusLabel, UI_TEXT } from '../i18n/translations';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  lang: LanguageCode;
}

export function ProjectsSection({ projects, lang }: ProjectsSectionProps) {
  const [filter, setFilter] = useState<'all' | ProjectCategory>('all');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const t = UI_TEXT[lang];

  const filterTabs: Array<{ key: 'all' | ProjectCategory; label: string }> = [
    { key: 'all', label: t.projects.filterAll },
    { key: 'ecommerce', label: t.projects.filterEcommerce },
    { key: 'events', label: t.projects.filterEvents },
    { key: 'personal', label: t.projects.filterPersonal },
  ];

  const filtered =
    filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return (
    <section
      id="projets"
      className="border-b border-zinc-200 bg-[#FAFAFA] py-20 dark:border-white/10 dark:bg-[#0B0B0D] lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider text-[#9A7B38] dark:text-[#C8A45D]">
              04. {t.projects.kicker}
            </p>
            <h2 className="font-display mt-2 text-balance text-3xl font-semibold tracking-tight text-[#0B0B0D] sm:text-4xl dark:text-white">
              {t.projects.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.projects.subtitle}
            </p>
          </div>

          {/* Contrôle segmenté de filtrage interactif */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-white/10 dark:bg-[#141418]">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-[#C8A45D] text-[#0B0B0D]'
                    : 'text-zinc-600 hover:text-[#0B0B0D] dark:text-zinc-300 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-white/15 dark:bg-[#141418]">
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.projects.emptyPersonal}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {filtered.map((project) => {
              const hasImg = Boolean(project.imageUrl) && !failedImages[project.id];
              return (
                <article
                  key={project.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-colors duration-200 hover:border-[#C8A45D]/60 dark:border-white/10 dark:bg-[#141418]"
                >
                  {/* Image 4:3 */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {hasImg ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [project.id]: true }))
                        }
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#141418] to-[#0B0B0D] p-6 text-center">
                        <span className="font-display text-2xl font-semibold text-[#C8A45D]">
                          {project.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu structuré sans badges pilules */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{getCategoryLabel(project.category, lang)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                          {getStatusLabel(project.status, lang)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white">
                        {project.title}
                      </h3>

                      <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                        {lang === 'fr' ? project.descriptionFr : project.descriptionEn}
                      </p>

                      {project.technologies.length > 0 && (
                        <p className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {project.technologies.join(' · ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4 dark:border-white/10">
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572] whitespace-nowrap"
                        >
                          <span>{t.projects.viewProject}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-[#0B0B0D] transition-colors hover:bg-[#D6B572] whitespace-nowrap"
                        >
                          <span>{t.projects.viewProject}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-[#C8A45D] whitespace-nowrap dark:border-white/15 dark:text-zinc-200"
                        >
                          <FolderGit2 className="h-3.5 w-3.5 text-[#C8A45D]" />
                          <span>{t.projects.viewGithub}</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <FolderGit2 className="h-3.5 w-3.5" />
                          <span>{t.projects.noGithubYet}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Fenêtre modale détaillée pour les concepts en préparation */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/15 dark:bg-[#141418]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#9A7B38] dark:text-[#C8A45D]">
                  {getCategoryLabel(selectedProject.category, lang)} ·{' '}
                  {getStatusLabel(selectedProject.status, lang)}
                </p>
                <h3
                  id="project-modal-title"
                  className="font-display mt-1 text-3xl font-semibold text-[#0B0B0D] dark:text-white"
                >
                  {selectedProject.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label={t.projects.closeModal}
                onClick={() => setSelectedProject(null)}
                className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:text-[#0B0B0D] dark:border-white/10 dark:text-zinc-300 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedProject.imageUrl && !failedImages[selectedProject.id] && (
              <img
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="mt-5 aspect-[4/3] w-full rounded-lg object-cover"
              />
            )}

            <p className="mt-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {lang === 'fr' ? selectedProject.descriptionFr : selectedProject.descriptionEn}
            </p>

            {selectedProject.technologies.length > 0 && (
              <p className="mt-4 border-t border-zinc-200 pt-4 text-xs font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                {selectedProject.technologies.join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
