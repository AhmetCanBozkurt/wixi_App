import { API_ROUTES } from '../config/api.config';

const BASE_URL = API_ROUTES.BASE_URL;
const API_VERSION = 'v1.0';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  titleDe?: string;
  titleEn?: string;
  titleAr?: string;
  summary?: string;
  summaryDe?: string;
  summaryEn?: string;
  summaryAr?: string;
  category?: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  createdAt: string;
  author: string;
  readingTime: number;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  updatedAt?: string;
  relatedPosts?: BlogPost[];
}

export interface BlogCategory {
  category: string;
  count: number;
}

export interface BlogPostsResponse {
  data: BlogPost[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

class CorporateBlogService {
  async getBlogPosts(
    page: number = 1,
    pageSize: number = 10,
    category?: string,
    search?: string
  ): Promise<{ success: boolean; data?: BlogPostsResponse; error?: string }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (category) {
        params.append('category', category);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(
        `${BASE_URL}/api/${API_VERSION}/public/corporate/blog?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getBlogPostBySlug(
    slug: string
  ): Promise<{ success: boolean; data?: BlogPostDetail; error?: string }> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/${API_VERSION}/public/corporate/blog/${slug}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Blog post not found' };
        }
        throw new Error(`Failed to fetch blog post: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getBlogCategories(): Promise<{ success: boolean; data?: BlogCategory[]; error?: string }> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/${API_VERSION}/public/corporate/blog/categories`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch blog categories: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new CorporateBlogService();

