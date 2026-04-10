import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  category: string;
  featured: boolean;
  date: string;
  publishedAt?: string;
  slug?: string;
}

export interface NewsItemDto {
  titleDe: string;
  titleTr: string;
  titleEn?: string;
  titleAr?: string;
  excerptDe: string;
  excerptTr: string;
  excerptEn?: string;
  excerptAr?: string;
  contentDe?: string;
  contentTr?: string;
  contentEn?: string;
  contentAr?: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  publishedAt?: string;
  slug?: string;
  displayOrder: number;
  isActive: boolean;
}

class NewsService {
  async getNewsItems(lang: string = 'de'): Promise<{ success: boolean; items: NewsItem[] }> {
    try {
      const response = await fetch(`${API_ROUTES.NEWS.BASE}?lang=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news items');
      }

      const result = await response.json();
      
      // Map backend response to frontend interface
      // Backend returns imageUrl, but frontend expects image
      // Also map language-specific fields
      if (result.success && result.items) {
        const mappedItems: NewsItem[] = result.items.map((item: any) => {
          // Get language-specific fields
          const title = lang === 'tr' ? item.titleTr : lang === 'en' ? (item.titleEn || item.titleDe) : lang === 'ar' ? (item.titleAr || item.titleDe) : item.titleDe;
          const excerpt = lang === 'tr' ? item.excerptTr : lang === 'en' ? (item.excerptEn || item.excerptDe) : lang === 'ar' ? (item.excerptAr || item.excerptDe) : item.excerptDe;
          const content = lang === 'tr' ? item.contentTr : lang === 'en' ? (item.contentEn || item.contentDe) : lang === 'ar' ? (item.contentAr || item.contentDe) : item.contentDe;
          
          // Format date from publishedAt
          const date = item.publishedAt 
            ? new Date(item.publishedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-SA' : 'de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : '';

          return {
            id: item.id,
            title: title || '',
            excerpt: excerpt || '',
            content: content,
            image: item.imageUrl || item.image || '', // Map imageUrl to image
            category: item.category || '',
            featured: item.featured || false,
            date: date,
            publishedAt: item.publishedAt,
            slug: item.slug,
          };
        });

        return {
          success: true,
          items: mappedItems,
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching news items:', error);
      throw error;
    }
  }

  async getNewsItemById(id: number, lang: string = 'de'): Promise<{ success: boolean; item: NewsItem }> {
    try {
      const response = await fetch(`${API_ROUTES.NEWS.BY_ID(id)}?lang=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news item');
      }

      const result = await response.json();
      
      // Map backend response to frontend interface
      if (result.success && result.item) {
        const item = result.item;
        
        // Get language-specific fields
        const title = lang === 'tr' ? item.titleTr : lang === 'en' ? (item.titleEn || item.titleDe) : lang === 'ar' ? (item.titleAr || item.titleDe) : item.titleDe;
        const excerpt = lang === 'tr' ? item.excerptTr : lang === 'en' ? (item.excerptEn || item.excerptDe) : lang === 'ar' ? (item.excerptAr || item.excerptDe) : item.excerptDe;
        const content = lang === 'tr' ? item.contentTr : lang === 'en' ? (item.contentEn || item.contentDe) : lang === 'ar' ? (item.contentAr || item.contentDe) : item.contentDe;
        
        // Format date from publishedAt
        const date = item.publishedAt 
          ? new Date(item.publishedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-SA' : 'de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : '';

        const mappedItem: NewsItem = {
          id: item.id,
          title: title || '',
          excerpt: excerpt || '',
          content: content,
          image: item.imageUrl || item.image || '', // Map imageUrl to image
          category: item.category || '',
          featured: item.featured || false,
          date: date,
          publishedAt: item.publishedAt,
          slug: item.slug,
        };

        return {
          success: true,
          item: mappedItem,
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching news item:', error);
      throw error;
    }
  }

  async getNewsItemBySlug(slug: string, lang: string = 'de'): Promise<{ success: boolean; item: NewsItem }> {
    try {
      const response = await fetch(`${API_ROUTES.NEWS.BY_SLUG(slug)}?lang=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news item');
      }

      const result = await response.json();
      
      // Map backend response to frontend interface
      if (result.success && result.item) {
        const item = result.item;
        
        // Get language-specific fields
        const title = lang === 'tr' ? item.titleTr : lang === 'en' ? (item.titleEn || item.titleDe) : lang === 'ar' ? (item.titleAr || item.titleDe) : item.titleDe;
        const excerpt = lang === 'tr' ? item.excerptTr : lang === 'en' ? (item.excerptEn || item.excerptDe) : lang === 'ar' ? (item.excerptAr || item.excerptDe) : item.excerptDe;
        const content = lang === 'tr' ? item.contentTr : lang === 'en' ? (item.contentEn || item.contentDe) : lang === 'ar' ? (item.contentAr || item.contentDe) : item.contentDe;
        
        // Format date from publishedAt
        const date = item.publishedAt 
          ? new Date(item.publishedAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-SA' : 'de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : '';

        const mappedItem: NewsItem = {
          id: item.id,
          title: title || '',
          excerpt: excerpt || '',
          content: content,
          image: item.imageUrl || item.image || '', // Map imageUrl to image
          category: item.category || '',
          featured: item.featured || false,
          date: date,
          publishedAt: item.publishedAt,
          slug: item.slug,
        };

        return {
          success: true,
          item: mappedItem,
        };
      }

      return result;
    } catch (error) {
      console.error('Error fetching news item:', error);
      throw error;
    }
  }

  async getAllNewsItems(): Promise<{ success: boolean; items: any[] }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.NEWS.ADMIN.BASE, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching news items:', error);
      throw error;
    }
  }

  async getNewsItemByIdAdmin(id: number): Promise<{ success: boolean; item: any }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.NEWS.ADMIN.BY_ID(id), {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching news item:', error);
      throw error;
    }
  }

  async createNewsItem(data: NewsItemDto): Promise<{ success: boolean; item: any; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.NEWS.ADMIN.BASE, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create news item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating news item:', error);
      throw error;
    }
  }

  async updateNewsItem(id: number, data: NewsItemDto): Promise<{ success: boolean; item: any; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.NEWS.ADMIN.BY_ID(id), {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update news item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating news item:', error);
      throw error;
    }
  }

  async deleteNewsItem(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ROUTES.NEWS.ADMIN.BY_ID(id), {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete news item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting news item:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<{ success: boolean; imageUrl: string; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ROUTES.NEWS.ADMIN.UPLOAD_IMAGE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(API_ROUTES.NEWS.ADMIN.DELETE_IMAGE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

export default new NewsService();

