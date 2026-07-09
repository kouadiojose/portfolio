/** Translatable content as stored/edited in the admin: {"en": ..., "fr": ...}. */
export type I18nStr = Record<string, string>;
export type I18nList = Record<string, string[]>;

// ---------- Public (language-resolved) models ----------

export interface SiteSettings {
  full_name: string;
  headline: string;
  tagline: string;
  hero_subtitle: string;
  availability: string;
  impacts: string[];
  about_title: string;
  about_paragraphs: string[];
  principles: string[];
  email: string;
  linkedin_url: string;
  github_url: string;
  cv_url: string;
  contact_lead: string;
}

export interface StackItem {
  id: number;
  category: string;
  name: string;
  sort_order: number;
}

export interface Project {
  id: number;
  slug: string;
  visual: string;
  title: string;
  role: string;
  summary: string;
  highlights: string[];
  context: string;
  problem: string;
  approach: string;
  contributions: string[];
  learnings: string;
  tags: string[];
  sort_order: number;
}

export interface Experience {
  id: number;
  title: string;
  organization: string;
  period: string;
  bullets: string[];
  sort_order: number;
}

export interface ValueProp {
  id: number;
  title: string;
  description: string;
  sort_order: number;
}

export interface PortfolioContent {
  settings: SiteSettings;
  stack: StackItem[];
  projects: Project[];
  experiences: Experience[];
  values: ValueProp[];
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  body: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  language: string;
  created_at: string;
  read: boolean;
}

// ---------- Admin (raw i18n) models ----------

export interface AdminSiteSettings {
  full_name: string;
  headline: I18nStr;
  tagline: I18nStr;
  hero_subtitle: I18nStr;
  availability: I18nStr;
  impacts: I18nList;
  about_title: I18nStr;
  about_paragraphs: I18nList;
  principles: I18nList;
  email: string;
  linkedin_url: string;
  github_url: string;
  cv_url: I18nStr;
  contact_lead: I18nStr;
}

export interface AdminProject {
  id: number;
  slug: string;
  visual: string;
  title: I18nStr;
  role: I18nStr;
  summary: I18nStr;
  highlights: I18nList;
  context: I18nStr;
  problem: I18nStr;
  approach: I18nStr;
  contributions: I18nList;
  learnings: I18nStr;
  tags: string[];
  featured: boolean;
  sort_order: number;
}

export interface AdminExperience {
  id: number;
  title: I18nStr;
  organization: string;
  period: I18nStr;
  bullets: I18nList;
  sort_order: number;
}

export interface AdminStackItem {
  id: number;
  category: I18nStr;
  name: string;
  sort_order: number;
}

export interface AdminValueProp {
  id: number;
  title: I18nStr;
  description: I18nStr;
  sort_order: number;
}
