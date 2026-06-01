export interface BlogCategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
}

export interface BlogPostListItem {
  id: string;
  tenantId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  summary?: string | null;
  featuredImageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  authorName?: string | null;
  readTimeMinutes: number;
  createdAt: string;
}

export interface BlogPost extends BlogPostListItem {
  contentHtml?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string | null;
}
