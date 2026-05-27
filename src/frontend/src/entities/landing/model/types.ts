export interface LandingModule {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  priceMonthly: number;
  priceYearly: number;
  featuresJson: string;
  colorAccent: string;
  isPopular: boolean;
  sortOrder: number;
  category?: string;
  tag?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  priceMonthly: number;
  priceYearly: number;
  featuresJson: string;
  maxProducts: number;
  maxUsers: number;
  sortOrder: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  slug: string;
  label: string;
  items: FaqItem[];
}

export interface PlatformStat {
  key: string;
  displayValue: string;
  label: string;
}

export interface ContactSubmitPayload {
  fullName: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  initials: string;
  avatarUrl?: string;
  avatarColor: string;
  role: string;
  department: string;
}

export interface CompanyMilestone {
  id: string;
  year: number;
  title: string;
  description?: string;
}

export interface AboutData {
  team: TeamMember[];
  milestones: CompanyMilestone[];
}

export interface CaseStudy {
  id: string;
  clientSlug: string;
  clientInitials: string;
  clientLogoUrl?: string;
  industry: string;
  metric1Value: string;
  metric1Label: string;
  metric2Value: string;
  metric2Label: string;
  isFeatured: boolean;
  clientName: string;
  title: string;
  description: string;
  quoteText?: string;
  quoteAuthor?: string;
}

export interface CasesData {
  featured: CaseStudy | null;
  all: CaseStudy[];
}

export interface RoadmapItem {
  id: string;
  category: string;
  plannedDate: string;
  voteCount: number;
  isShipped: boolean;
  title: string;
  description: string;
}

export interface RoadmapPhase {
  phaseId: string;
  phaseLabel: string;
  items: RoadmapItem[];
}

export interface ChangelogEntry {
  id: string;
  version: string;
  releaseDate: string;
  tag: string;
  title: string;
  description: string;
}

export interface RoadmapData {
  phases: RoadmapPhase[];
  changelog: ChangelogEntry[];
}
