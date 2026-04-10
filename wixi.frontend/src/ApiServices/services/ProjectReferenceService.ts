import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

export interface ProjectReferenceDto {
  id: number;
  title: string;
  titleDe?: string;
  titleEn?: string;
  titleAr?: string;
  description: string;
  descriptionDe?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  clientName?: string;
  country?: string;
  documentType?: string;
  documentTypeDe?: string;
  documentTypeEn?: string;
  documentTypeAr?: string;
  university?: string;
  applicationDate?: string;
  approvalDate?: string;
  processingDays?: number;
  documentImageUrl?: string;
  status?: string;
  statusDe?: string;
  statusEn?: string;
  statusAr?: string;
  highlights?: string;
  highlightsDe?: string;
  highlightsEn?: string;
  highlightsAr?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectReferenceDto {
  title: string;
  titleDe?: string;
  titleEn?: string;
  titleAr?: string;
  description: string;
  descriptionDe?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  clientName?: string;
  country?: string;
  documentType?: string;
  documentTypeDe?: string;
  documentTypeEn?: string;
  documentTypeAr?: string;
  university?: string;
  applicationDate?: string;
  approvalDate?: string;
  processingDays?: number;
  documentImageUrl?: string;
  status?: string;
  statusDe?: string;
  statusEn?: string;
  statusAr?: string;
  highlights?: string;
  highlightsDe?: string;
  highlightsEn?: string;
  highlightsAr?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface ProjectReferenceStatistics {
  totalProjects: number;
  avgProcessingDays: number;
  fastestProcessingDays: number;
  fastestProjectTitle?: string;
}

class ProjectReferenceService {
  private tokenService = TokenService.getInstance();

  private async getAuthHeader() {
    const token = await this.tokenService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Admin endpoints
  async getAllProjectReferences(page: number = 1, pageSize: number = 1000): Promise<ProjectReferenceDto[]> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references?page=${page}&pageSize=${pageSize}`,
        {
          headers: await this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error('Proje referansları alınamadı');
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching project references:', error);
      throw error;
    }
  }

  async getProjectReferenceById(id: number): Promise<ProjectReferenceDto> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references/${id}`,
        {
          headers: await this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error('Proje referansı alınamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project reference:', error);
      throw error;
    }
  }

  async createProjectReference(data: CreateProjectReferenceDto): Promise<{ id: number }> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references`,
        {
          method: 'POST',
          headers: await this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Proje referansı oluşturulamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project reference:', error);
      throw error;
    }
  }

  async updateProjectReference(id: number, data: CreateProjectReferenceDto): Promise<void> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references/${id}`,
        {
          method: 'PUT',
          headers: await this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Proje referansı güncellenemedi');
      }
    } catch (error) {
      console.error('Error updating project reference:', error);
      throw error;
    }
  }

  async deleteProjectReference(id: number): Promise<void> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references/${id}`,
        {
          method: 'DELETE',
          headers: await this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error('Proje referansı silinemedi');
      }
    } catch (error) {
      console.error('Error deleting project reference:', error);
      throw error;
    }
  }

  async toggleProjectReferenceActive(id: number): Promise<{ isActive: boolean }> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references/${id}/toggle-active`,
        {
          method: 'PATCH',
          headers: await this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error('Durum değiştirilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling active status:', error);
      throw error;
    }
  }

  async toggleProjectReferenceFeatured(id: number): Promise<{ isFeatured: boolean }> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references/${id}/toggle-featured`,
        {
          method: 'PATCH',
          headers: await this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error('Öne çıkarma durumu değiştirilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  }

  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = await this.tokenService.getToken();
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/project-references/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Görsel yüklenemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Public endpoints
  async getPublicProjectReferences(limit?: number): Promise<ProjectReferenceDto[]> {
    try {
      const url = limit
        ? `${API_ROUTES.BASE_URL}/api/v1.0/project-references?limit=${limit}`
        : `${API_ROUTES.BASE_URL}/api/v1.0/project-references`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Proje referansları alınamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching public project references:', error);
      throw error;
    }
  }

  async getPublicStatistics(): Promise<ProjectReferenceStatistics> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/project-references/statistics`
      );

      if (!response.ok) {
        throw new Error('İstatistikler alınamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

const projectReferenceService = new ProjectReferenceService();
export default projectReferenceService;

