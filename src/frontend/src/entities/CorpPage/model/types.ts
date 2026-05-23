export interface CorpPage {
  id: string;
  tenantId: string;
  pageType: string;
  slug: string;
  title: string;
  layoutConfigJson: string | null;
  themeOverrideJson: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  openGraphImageUrl: string | null;
  backlinksJson: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CorpPageSummary {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface CorpPageVersionSummary {
  id: string;
  checkpointLabel: string | null;
  createdAt: string;
  createdByUser: string | null;
}
