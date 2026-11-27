import type { LanguageCode, PhotoCategory, ProjectCategory, ProjectStatus } from '../types/portfolio';

export const UI_TEXT = {
  fr: {
    nav: {
      about: 'À propos',
      education: 'Parcours',
      projects: 'Projets',
      gallery: 'Galerie',
      contact: 'Contact',
      downloadCv: 'Télécharger CV',
      skills: 'Compétences',
      experiences: 'Expériences',
      languages: 'Langues',
      objectives: 'Objectifs',
      interests: 'Intérêts',
      admin: 'Administration',
    },
    hero: {
      ctaJourney: 'Découvrir mon parcours',
      ctaContact: 'Me contacter',
      ctaCv: 'Télécharger mon CV',
      sharePortfolio: 'Partager le portfolio',
      copiedLink: 'Lien copié dans le presse-papier',
      photoPlaceholderTitle: 'Photographie principale',
      photoPlaceholderDesc:
        'Aucune photo sélectionnée. Ajoutez votre portrait réel depuis l’espace d’administration.',
      goToAdminPhoto: 'Ajouter ma photo',
      lightMode: 'Mode clair',
      darkMode: 'Mode sombre',
    },
    about: {
      kicker: 'Identité & Parcours',
      heading: 'À propos de moi',
      photoPlaceholder: 'Espace réservé à votre photographie personnelle',
      originLabel: 'Origine',
      originValue: 'Sénégal',
      residenceLabel: 'Résidence actuelle',
      statusLabel: 'Disponibilité',
    },
    education: {
      kicker: 'Formation',
      heading: 'Mon parcours académique',
      validatedTitle: 'Diplômes obtenus & formations validées',
      envisagedTitle: 'Formation envisagée',
      validatedBadge: 'Formation validée',
      envisagedBadge: 'Envisagée',
      viewCertificate: 'Voir le justificatif',
    },
    skills: {
      kicker: 'Savoir-faire',
      heading: 'Mes compétences',
      subtitle:
        'Compétences techniques, multimédias et outils maîtrisés. Les niveaux sont configurables depuis le tableau de bord administrateur.',
      catWeb: 'A. Développement web',
      catMultimedia: 'B. Multimédia',
      catTools: 'C. Outils',
      levelUnset: 'Niveau à définir dans l’administration',
    },
    projects: {
      kicker: 'Portfolio',
      heading: 'Mes projets',
      subtitle:
        'Projets conceptuels, plateformes en cours de développement et réalisations personnelles.',
      filterAll: 'Tous',
      filterEcommerce: 'E-Commerce',
      filterEvents: 'Événementiel',
      filterPersonal: 'Mes projets personnels',
      viewProject: 'Voir le projet',
      viewGithub: 'Voir le code source GitHub',
      noGithubYet: 'Dépôt GitHub en cours de préparation',
      noLiveYet: 'Aperçu du concept',
      emptyPersonal:
        'Cette catégorie accueillera prochainement mes nouveaux projets de développement web, applications et créations multimédias.',
      closeModal: 'Fermer',
    },
    experiences: {
      kicker: 'Expérience terrain',
      heading: 'Expériences professionnelles',
      missionsTitle: 'Missions principales',
      highlightsTitle: 'Qualités professionnelles mobilisées',
    },
    languages: {
      kicker: 'Communication',
      heading: 'Langues',
    },
    objectives: {
      kicker: 'Vision professionnelle',
      heading: 'Mes objectifs professionnels',
    },
    interests: {
      kicker: 'Équilibre & Curiosité',
      heading: 'Centres d’intérêt',
    },
    gallery: {
      kicker: 'Photographie',
      heading: 'Galerie',
      subtitle:
        'Photographies personnelles authentiques ajoutées directement par Cherif Balde.',
      allPhotos: 'Toutes',
      emptyTitle: 'La galerie est prête pour vos photographies',
      emptyDesc:
        'Aucune photographie n’a encore été ajoutée. Connectez-vous à l’espace administrateur pour importer vos portraits et photos professionnelles depuis votre ordinateur.',
      openAdmin: 'Gérer la galerie',
      heroMarker: 'Photo principale',
      aboutMarker: 'Photo À propos',
    },
    contact: {
      kicker: 'Collaborons ensemble',
      heading: 'Contact',
      subtitle:
        'Disponible pour des opportunités professionnelles, collaborations digitales et projets web au Maroc, au Sénégal et à l’international.',
      infoTitle: 'Coordonnées directes',
      emailLabel: 'Email professionnel',
      phoneLabel: 'Téléphone',
      locationLabel: 'Localisation',
      websiteLabel: 'Site web',
      whatsappCta: 'Discuter sur WhatsApp',
      socialTitle: 'Réseaux & liens',
      formTitle: 'Envoyer un message',
      nameLabel: 'Nom complet',
      emailInputLabel: 'Adresse email',
      subjectLabel: 'Objet du message',
      messageLabel: 'Message',
      submitBtn: 'Envoyer',
      sendingBtn: 'Envoi en cours...',
      successInboxOnly:
        'Votre message a bien été enregistré dans la boîte de réception sécurisée du portfolio.',
      successEmailAndInbox:
        'Votre message a été transmis par e-mail et enregistré dans la boîte de réception du portfolio.',
    },
    footer: {
      rights: 'Tous droits réservés.',
      backToTop: 'Haut de page',
      adminLink: 'Espace administrateur',
    },
    notFound: {
      code: '404',
      title: 'Page introuvable',
      desc: 'La page que vous recherchez n’existe pas ou a été déplacée.',
      backHome: 'Retour à l’accueil',
    },
  },
  en: {
    nav: {
      about: 'About',
      education: 'Education',
      projects: 'Projects',
      gallery: 'Gallery',
      contact: 'Contact',
      downloadCv: 'Download CV',
      skills: 'Skills',
      experiences: 'Experience',
      languages: 'Languages',
      objectives: 'Goals',
      interests: 'Interests',
      admin: 'Admin',
    },
    hero: {
      ctaJourney: 'Explore my journey',
      ctaContact: 'Contact me',
      ctaCv: 'Download my CV',
      sharePortfolio: 'Share portfolio',
      copiedLink: 'Link copied to clipboard',
      photoPlaceholderTitle: 'Primary Portrait',
      photoPlaceholderDesc:
        'No portrait selected yet. Upload your real photograph from the admin dashboard.',
      goToAdminPhoto: 'Upload my photo',
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
    },
    about: {
      kicker: 'Identity & Story',
      heading: 'About me',
      photoPlaceholder: 'Reserved for your personal photograph',
      originLabel: 'Origin',
      originValue: 'Senegal',
      residenceLabel: 'Current location',
      statusLabel: 'Availability',
    },
    education: {
      kicker: 'Academic Background',
      heading: 'Academic Timeline',
      validatedTitle: 'Earned Diplomas & Validated Studies',
      envisagedTitle: 'Planned Education',
      validatedBadge: 'Completed',
      envisagedBadge: 'Planned',
      viewCertificate: 'View certificate',
    },
    skills: {
      kicker: 'Capabilities',
      heading: 'My Skills',
      subtitle:
        'Web development, multimedia production, and software tools. Skill levels are configurable from the admin dashboard.',
      catWeb: 'A. Web Development',
      catMultimedia: 'B. Multimedia',
      catTools: 'C. Tools',
      levelUnset: 'Level configurable in admin',
    },
    projects: {
      kicker: 'Portfolio',
      heading: 'Projects',
      subtitle:
        'Concept platforms, ongoing web applications, and personal multimedia projects.',
      filterAll: 'All',
      filterEcommerce: 'E-Commerce',
      filterEvents: 'Events',
      filterPersonal: 'Personal Projects',
      viewProject: 'View project',
      viewGithub: 'GitHub Source Code',
      noGithubYet: 'GitHub repository in preparation',
      noLiveYet: 'Concept overview',
      emptyPersonal:
        'This category will soon host upcoming personal web development, application, and multimedia projects.',
      closeModal: 'Close',
    },
    experiences: {
      kicker: 'Work History',
      heading: 'Professional Experience',
      missionsTitle: 'Key Responsibilities',
      highlightsTitle: 'Core Interpersonal Strengths',
    },
    languages: {
      kicker: 'Communication',
      heading: 'Languages',
    },
    objectives: {
      kicker: 'Career Vision',
      heading: 'Professional Objectives',
    },
    interests: {
      kicker: 'Curiosity & Balance',
      heading: 'Interests',
    },
    gallery: {
      kicker: 'Photography',
      heading: 'Gallery',
      subtitle: 'Authentic personal photographs uploaded directly by Cherif Balde.',
      allPhotos: 'All',
      emptyTitle: 'The gallery is ready for your photographs',
      emptyDesc:
        'No photographs have been added yet. Sign in to the admin dashboard to upload your portraits and professional photos from your computer.',
      openAdmin: 'Manage gallery',
      heroMarker: 'Primary photo',
      aboutMarker: 'About photo',
    },
    contact: {
      kicker: 'Get in touch',
      heading: 'Contact',
      subtitle:
        'Open to professional opportunities, digital collaborations, and web projects in Morocco, Senegal, and internationally.',
      infoTitle: 'Direct Contact',
      emailLabel: 'Professional email',
      phoneLabel: 'Phone',
      locationLabel: 'Location',
      websiteLabel: 'Website',
      whatsappCta: 'Chat on WhatsApp',
      socialTitle: 'Social & Links',
      formTitle: 'Send a message',
      nameLabel: 'Full name',
      emailInputLabel: 'Email address',
      subjectLabel: 'Subject',
      messageLabel: 'Message',
      submitBtn: 'Send message',
      sendingBtn: 'Sending...',
      successInboxOnly:
        'Your message has been securely saved to the portfolio inbox.',
      successEmailAndInbox:
        'Your message was delivered by email and saved to the portfolio inbox.',
    },
    footer: {
      rights: 'All rights reserved.',
      backToTop: 'Back to top',
      adminLink: 'Admin Dashboard',
    },
    notFound: {
      code: '404',
      title: 'Page not found',
      desc: 'The page you are looking for does not exist or has been moved.',
      backHome: 'Back to home',
    },
  },
} as const;

export function getStatusLabel(status: ProjectStatus, lang: LanguageCode): string {
  if (lang === 'en') {
    if (status === 'completed') return 'Completed';
    if (status === 'in_progress') return 'In development';
    return 'Concept';
  }
  if (status === 'completed') return 'Réalisation terminée';
  if (status === 'in_progress') return 'En développement';
  return 'Concept';
}

export function getCategoryLabel(category: ProjectCategory, lang: LanguageCode): string {
  if (lang === 'en') {
    if (category === 'ecommerce') return 'E-Commerce';
    if (category === 'events') return 'Events';
    return 'Personal Projects';
  }
  if (category === 'ecommerce') return 'E-Commerce';
  if (category === 'events') return 'Événementiel';
  return 'Projets personnels';
}

export function getPhotoCategoryLabel(category: PhotoCategory, lang: LanguageCode): string {
  const map: Record<PhotoCategory, { fr: string; en: string }> = {
    portrait: { fr: 'Portrait professionnel', en: 'Professional portrait' },
    attire: { fr: 'Tenue professionnelle', en: 'Business attire' },
    workspace: { fr: 'Environnement de travail', en: 'Workspace' },
    presentation: { fr: 'Présentation', en: 'Presentation' },
    events: { fr: 'Événements', en: 'Events' },
    other: { fr: 'Autres', en: 'Other' },
  };
  return map[category]?.[lang] || map.other[lang];
}
