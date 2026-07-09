export interface Fact {
  label: string;
  value: string;
}

export interface SiteSettings {
  full_name: string;
  headline: string;
  hero_eyebrow: string;
  hero_subtitle: string;
  availability: string;
  about_title: string;
  about_paragraphs: string[];
  facts: Fact[];
  email: string;
  linkedin_url: string;
  github_url: string;
  cv_url: string;
  contact_lead: string;
}

export interface ExpertiseItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
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
  title: string;
  role: string;
  summary: string;
  context: string;
  highlights: string[];
  tags: string[];
  featured: boolean;
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

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  created_at: string;
  read: boolean;
}

export interface PortfolioContent {
  settings: SiteSettings;
  expertise: ExpertiseItem[];
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
