import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

export interface ITestimonialDto {
  id: number;
  name: string;
  role?: string;
  location?: string;
  company?: string;
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  rating: number;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ICreateTestimonialDto {
  name: string;
  role?: string;
  location?: string;
  company?: string;
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  rating: number;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface IUpdateTestimonialDto {
  name: string;
  role?: string;
  location?: string;
  company?: string;
  content: string;
  contentDe?: string;
  contentEn?: string;
  contentAr?: string;
  rating: number;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ITestimonialListResponse {
  items: ITestimonialDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const testimonialService = {
  // Public API - Get active testimonials
  async getPublicTestimonials(limit?: number): Promise<ITestimonialDto[]> {
    const url = limit 
      ? `${API_ROUTES.BASE_URL}/api/v1.0/public/testimonials?limit=${limit}`
      : `${API_ROUTES.BASE_URL}/api/v1.0/public/testimonials`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Referanslar alınamadı');
    }

    return response.json();
  },

  // Admin API - Get all testimonials with pagination
  async getAllTestimonials(params: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
    search?: string;
  }): Promise<ITestimonialListResponse> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Referanslar alınamadı');
    }

    return response.json();
  },

  // Admin API - Get single testimonial
  async getTestimonial(id: number): Promise<ITestimonialDto> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Referans alınamadı');
    }

    return response.json();
  },

  // Admin API - Create testimonial
  async createTestimonial(data: ICreateTestimonialDto): Promise<ITestimonialDto> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Referans oluşturulamadı');
    }

    return response.json();
  },

  // Admin API - Update testimonial
  async updateTestimonial(id: number, data: IUpdateTestimonialDto): Promise<ITestimonialDto> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Referans güncellenemedi');
    }

    return response.json();
  },

  // Admin API - Delete testimonial
  async deleteTestimonial(id: number): Promise<void> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Referans silinemedi');
    }
  },

  // Admin API - Upload image
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials/upload-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Resim yüklenemedi');
    }

    return response.json();
  },

  // Admin API - Toggle active status
  async toggleActive(id: number): Promise<{ id: number; isActive: boolean; message: string }> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);

    if (!token) {
      throw new Error('Yetkilendirme hatası');
    }

    const response = await fetch(
      `${API_ROUTES.BASE_URL}/api/v1.0/admin/testimonials/${id}/toggle-active`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Durum güncellenemedi');
    }

    return response.json();
  },
};

export default testimonialService;

