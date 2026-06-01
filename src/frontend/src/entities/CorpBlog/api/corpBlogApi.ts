import { apiClient } from '../../../shared/api/axiosConfig';
import type { BlogCategory, BlogPost, BlogPostListItem } from '../model/types';

const BASE = '/web-builder/blog';

export const corpBlogApi = {
  getCategories: () =>
    apiClient.get<BlogCategory[]>(`${BASE}/categories`),

  createCategory: (data: { name: string; slug: string; description?: string; sortOrder?: number }) =>
    apiClient.post<BlogCategory>(`${BASE}/categories`, data),

  updateCategory: (id: string, data: { name: string; slug: string; description?: string; sortOrder: number }) =>
    apiClient.put(`${BASE}/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete(`${BASE}/categories/${id}`),

  getPosts: (params?: { categoryId?: string; isPublished?: boolean }) =>
    apiClient.get<BlogPostListItem[]>(`${BASE}/posts`, { params }),

  getPostBySlug: (slug: string) =>
    apiClient.get<BlogPost>(`${BASE}/posts/${slug}`),

  createPost: (data: Omit<BlogPost, 'id' | 'tenantId' | 'createdAt' | 'isPublished' | 'publishedAt'>) =>
    apiClient.post<BlogPost>(`${BASE}/posts`, data),

  updatePost: (id: string, data: Omit<BlogPost, 'id' | 'tenantId' | 'createdAt' | 'isPublished' | 'publishedAt'>) =>
    apiClient.put(`${BASE}/posts/${id}`, data),

  publishPost: (id: string, isPublished: boolean) =>
    apiClient.put(`${BASE}/posts/${id}/publish`, { isPublished }),

  deletePost: (id: string) =>
    apiClient.delete(`${BASE}/posts/${id}`),
};
