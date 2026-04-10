import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  TekstilApiResponse,
  TekstilPaginatedResponse,
} from '../types/TekstilTypes';

class TekstilProjectService {
  /**
   * Get all projects with pagination (public)
   */
  async getAllProjects(
    page: number = 1, 
    pageSize: number = 10, 
    lang?: string,
    categoryId?: number,
    isFeatured?: boolean
  ): Promise<{ success: boolean; data: TekstilPaginatedResponse<ProjectDto> | null }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (lang) params.append('lang', lang);
      if (categoryId) params.append('categoryId', categoryId.toString());
      if (isFeatured !== undefined) params.append('isFeatured', isFeatured.toString());

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECTS}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const result: TekstilApiResponse<TekstilPaginatedResponse<ProjectDto>> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get featured projects (public)
   */
  async getFeaturedProjects(lang?: string): Promise<{ success: boolean; data: ProjectDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECTS}/featured?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECTS}/featured`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch featured projects');
      }

      const result: TekstilApiResponse<ProjectDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching featured projects:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get project by ID (public)
   */
  async getProjectById(id: number, lang?: string): Promise<{ success: boolean; data: ProjectDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECTS}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECTS}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const result: TekstilApiResponse<ProjectDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get project by slug (public)
   */
  async getProjectBySlug(slug: string, lang?: string): Promise<{ success: boolean; data: ProjectDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECTS}/slug/${slug}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECTS}/slug/${slug}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const result: TekstilApiResponse<ProjectDto> = await response.json();
      return {
        success: true,
        data: result.value,
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get projects by category (public)
   */
  async getProjectsByCategory(categoryId: number, lang?: string): Promise<{ success: boolean; data: ProjectDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.PROJECTS}/category/${categoryId}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.PROJECTS}/category/${categoryId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects by category');
      }

      const result: TekstilApiResponse<ProjectDto[]> = await response.json();
      return {
        success: true,
        data: result.value || [],
      };
    } catch (error) {
      console.error('Error fetching projects by category:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Create project (admin only)
   */
  async createProject(project: CreateProjectDto): Promise<{ success: boolean; data: ProjectDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECTS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const result: TekstilApiResponse<ProjectDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update project (admin only)
   */
  async updateProject(id: number, project: UpdateProjectDto): Promise<{ success: boolean; data: ProjectDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }

      const result: TekstilApiResponse<ProjectDto> = await response.json();
      return {
        success: true,
        data: result.value,
        message: result.message,
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete project (admin only)
   */
  async deleteProject(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECTS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }

      return {
        success: true,
        message: 'Project deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Increment project view count (public)
   */
  async incrementViewCount(id: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.PROJECTS}/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to increment view count');
      }

      return { success: true };
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return { success: false };
    }
  }
}

export default new TekstilProjectService();


