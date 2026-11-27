export type LanguageCode = 'fr' | 'en';

export type ProjectStatus = 'concept' | 'in_progress' | 'completed';
export type ProjectCategory = 'ecommerce' | 'events' | 'personal';
export type SkillCategory = 'web' | 'multimedia' | 'tools';
export type PhotoCategory =
  | 'portrait'
  | 'attire'
  | 'workspace'
  | 'presentation'
  | 'events'
  | 'other';

export interface SocialLinks {
  github: string;
  tiktok: string;
  linkedin: string;
  whatsapp: string;
  website: string;
  other: string;
}

export interface ProfileData {
  fullName: string;
  titleFr: string;
  titleEn: string;
  taglineFr: string;
  taglineEn: string;
  heroSummaryFr: string;
  heroSummaryEn: string;
  aboutStoryFr: string[];
  aboutStoryEn: string[];
  locationFr: string;
  locationEn: string;
  availabilityFr: string;
  availabilityEn: string;
  email: string;
  phone: string;
  websiteUrl: string;
  cvPdfUrl: string;
  heroPhotoId: string | null;
  aboutPhotoId: string | null;
  social: SocialLinks;
}

export interface EducationItem {
  id: string;
  period: string;
  titleFr: string;
  titleEn: string;
  institution: string;
  location: string;
  status: 'validated' | 'envisaged';
  descriptionFr: string;
  descriptionEn: string;
  certificateUrl?: string;
  certificateName?: string;
}

export interface SkillItem {
  id: string;
  category: SkillCategory;
  nameFr: string;
  nameEn: string;
  level: number | null;
  levelLabelFr: string;
  levelLabelEn: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  descriptionFr: string;
  descriptionEn: string;
  technologies: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
}

export interface ExperienceItem {
  id: string;
  roleFr: string;
  roleEn: string;
  companyOrSectorFr: string;
  companyOrSectorEn: string;
  location: string;
  period: string;
  missionsFr: string[];
  missionsEn: string[];
  highlightsFr: string[];
  highlightsEn: string[];
}

export interface LanguageItem {
  id: string;
  nameFr: string;
  nameEn: string;
  proficiencyFr: string;
  proficiencyEn: string;
}

export interface ObjectivesData {
  sectionTitleFr: string;
  sectionTitleEn: string;
  quoteFr: string;
  quoteEn: string;
  itemsFr: string[];
  itemsEn: string[];
}

export interface InterestItem {
  id: string;
  labelFr: string;
  labelEn: string;
  iconKey: 'cpu' | 'compass' | 'activity' | 'plane' | 'book' | 'camera' | 'code' | 'globe';
}

export interface GalleryPhoto {
  id: string;
  url: string;
  captionFr: string;
  captionEn: string;
  category: PhotoCategory;
  uploadedAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  emailDispatched: boolean;
}

export interface PortfolioData {
  profile: ProfileData;
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  languages: LanguageItem[];
  objectives: ObjectivesData;
  interests: InterestItem[];
  gallery: GalleryPhoto[];
}
