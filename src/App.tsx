import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { DEFAULT_PORTFOLIO_DATA } from '../server/defaultData';
import type { LanguageCode, PortfolioData } from './types/portfolio';
import { downloadPortfolioCv } from './utils/generateCvPdf';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { EducationSection } from './components/EducationSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { LanguagesSection } from './components/LanguagesSection';
import { ObjectivesInterestsSection } from './components/ObjectivesInterestsSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { NotFoundPage } from './components/NotFoundPage';

const SECTION_ROUTES: Record<string, string> = {
  '/': 'accueil',
  '/a-propos': 'a-propos',
  '/parcours': 'parcours',
  '/competences': 'competences',
  '/projets': 'projets',
  '/experiences': 'experiences',
  '/langues': 'langues',
  '/objectifs': 'objectifs',
  '/centres-interet': 'centres-interet',
  '/galerie': 'galerie',
  '/contact': 'contact',
};

export default function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = window.localStorage.getItem('cb_theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = window.localStorage.getItem('cb_lang');
    return saved === 'en' ? 'en' : 'fr';
  });
  const [portfolio, setPortfolio] = useState<PortfolioData>(DEFAULT_PORTFOLIO_DATA);

  // Synchroniser la classe .dark sur <html> pour Tailwind v4 @custom-variant dark
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('cb_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem('cb_lang', lang);
  }, [lang]);

  // Charger les données réelles depuis le backend Express
  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { portfolio?: PortfolioData } | null) => {
        if (data?.portfolio) {
          setPortfolio(data.portfolio);
        }
      })
      .catch(() => {
        // Conserve les données initiales en cas d'indisponibilité réseau temporaire
      });
  }, []);

  // Optionnel : Google Analytics respectueux de la confidentialité si VITE_GA_MEASUREMENT_ID est défini
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
    if (!gaId || !gaId.startsWith('G-')) return;
    if (document.getElementById('cb-ga-script')) return;

    const script = document.createElement('script');
    script.id = 'cb-ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer?.push(args);
    };
    w.gtag('js', new Date());
    w.gtag('config', gaId, { anonymize_ip: true });
  }, []);

  // Écouter les retours navigateur
  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Faire défiler vers la section correspondant à la route au chargement
  useEffect(() => {
    const targetId = SECTION_ROUTES[pathname];
    if (!targetId || targetId === 'accueil') return;
    const timer = setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleNavigate = useCallback((nextPath: string, sectionId?: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setPathname(nextPath);
    }
    if (sectionId) {
      setTimeout(() => {
        if (sectionId === 'accueil') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 40);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const heroPhoto =
    portfolio.gallery.find((p) => p.id === portfolio.profile.heroPhotoId) || null;
  const aboutPhoto =
    portfolio.gallery.find((p) => p.id === portfolio.profile.aboutPhotoId) || null;

  const isAdminRoute = pathname === '/admin';
  const isKnownPublicRoute = Boolean(SECTION_ROUTES[pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0D] transition-colors duration-200 dark:bg-[#0B0B0D] dark:text-white">
        <Navbar
          brandName={portfolio.profile.fullName}
          lang={lang}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onToggleLang={() => setLang((prev) => (prev === 'fr' ? 'en' : 'fr'))}
          onNavigate={handleNavigate}
          onDownloadCv={() => downloadPortfolioCv(portfolio, lang)}
        />

        {isAdminRoute ? (
          <AdminDashboard
            portfolio={portfolio}
            lang={lang}
            onPortfolioUpdated={setPortfolio}
            onNavigate={handleNavigate}
          />
        ) : !isKnownPublicRoute ? (
          <NotFoundPage lang={lang} onNavigate={handleNavigate} />
        ) : (
          <main>
            <HeroSection
              profile={portfolio.profile}
              heroPhoto={heroPhoto}
              lang={lang}
              theme={theme}
              onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              onToggleLang={() => setLang((prev) => (prev === 'fr' ? 'en' : 'fr'))}
              onNavigate={handleNavigate}
              onDownloadCv={() => downloadPortfolioCv(portfolio, lang)}
            />

            <AboutSection
              profile={portfolio.profile}
              aboutPhoto={aboutPhoto}
              lang={lang}
              onNavigate={handleNavigate}
            />

            <EducationSection education={portfolio.education} lang={lang} />

            <SkillsSection skills={portfolio.skills} lang={lang} />

            <ProjectsSection projects={portfolio.projects} lang={lang} />

            <ExperienceSection experiences={portfolio.experiences} lang={lang} />

            <LanguagesSection languages={portfolio.languages} lang={lang} />

            <ObjectivesInterestsSection
              objectives={portfolio.objectives}
              interests={portfolio.interests}
              lang={lang}
            />

            <GallerySection
              gallery={portfolio.gallery}
              heroPhotoId={portfolio.profile.heroPhotoId}
              aboutPhotoId={portfolio.profile.aboutPhotoId}
              lang={lang}
              onNavigate={handleNavigate}
            />

            <ContactSection profile={portfolio.profile} lang={lang} />
          </main>
        )}

        <Footer profile={portfolio.profile} lang={lang} onNavigate={handleNavigate} />
      </div>
    </MotionConfig>
  );
}
