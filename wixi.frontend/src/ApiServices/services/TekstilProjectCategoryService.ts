import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  ProjectCategoryDto,
  CreateProjectCategoryDto,
  UpdateProjectCategoryDto,
  TekstilApiResponse,
} from '../types/TekstilTypes';

class TekstilProjectCategoryService {
  /**
   * Get all project categories (public)
   */
  async getAllProjectCategories(lang?: string): Promise<{ success: boolean; data: ProjectCategoryDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}?lang=${lang}` 
        : API_ROUTES.TEKSTIL.PROJECT_CATEGORIES;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project categories');
      }

      const result: TekstilApiResponse<ProjectCategoryDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching project categories:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get active project categories (public)
   */
  async getActiveProjectCategories(lang?: string): Promise<{ success: boolean; data: ProjectCategoryDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/active?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/active`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active project categories');
      }

      const result: TekstilApiResponse<ProjectCategoryDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching active project categories:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get project category by ID (public)
   */
  async getProjectCategoryById(id: number, lang?: string): Promise<{ success: boolean; data: ProjectCategoryDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project category');
      }

      const result: TekstilApiResponse<ProjectCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching project category:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get project category by slug (public)
   */
  async getProjectCategoryBySlug(slug: string, lang?: string): Promise<{ success: boolean; data: ProjectCategoryDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/slug/${slug}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/slug/${slug}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project category');
      }

      const result: TekstilApiResponse<ProjectCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching project category:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Create project category (admin only)
   */
  async createProjectCategory(category: CreateProjectCategoryDto): Promise<{ success: boolean; data: ProjectCategoryDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project category');
      }

      const result: TekstilApiResponse<ProjectCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error creating project category:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update project category (admin only)
   */
  async updateProjectCategory(id: number, category: UpdateProjectCategoryDto): Promise<{ success: boolean; data: ProjectCategoryDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project category');
      }

      const result: TekstilApiResponse<ProjectCategoryDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error updating project category:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete project category (admin only)
   */
  async deleteProjectCategory(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECT_CATEGORIES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project category');
      }

      return {
        success: true,
        message: 'Project category deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting project category:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilProjectCategoryService();


