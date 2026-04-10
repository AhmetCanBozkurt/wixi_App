import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  AboutDto,
  CreateAboutDto,
  UpdateAboutDto,
} from '../types/TekstilTypes';

class TekstilAboutService {
  /**
   * Get all about entries (public)
   */
  async getAllAbout(lang?: string): Promise<{ success: boolean; data: AboutDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.ABOUT}?lang=${lang}` 
        : API_ROUTES.TEKSTIL.ABOUT;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch about entries');
      }

      const result: AboutDto[] = await response.json();
      return {
        success: true,
        data: result || [],
      };
    } catch (error) {
      console.error('Error fetching about entries:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get active about entry (public)
   */
  async getActiveAbout(lang?: string): Promise<{ success: boolean; data: AboutDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.ABOUT}/active?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.ABOUT}/active`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active about entry');
      }

      const result: AboutDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching active about entry:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get about by ID (public)
   */
  async getAboutById(id: number, lang?: string): Promise<{ success: boolean; data: AboutDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.ABOUT}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.ABOUT}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch about entry');
      }

      const result: AboutDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching about entry:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Create about entry (admin only)
   */
  async createAbout(about: CreateAboutDto): Promise<{ success: boolean; data: AboutDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.ABOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(about),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create about entry');
      }

      const result: AboutDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error creating about entry:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update about entry (admin only)
   */
  async updateAbout(id: number, about: UpdateAboutDto): Promise<{ success: boolean; data: AboutDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.ABOUT}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(about),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update about entry');
      }

      const result: AboutDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error updating about entry:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete about entry (admin only)
   */
  async deleteAbout(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.ABOUT}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete about entry');
      }

      return {
        success: true,
        message: 'About entry deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting about entry:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilAboutService();

