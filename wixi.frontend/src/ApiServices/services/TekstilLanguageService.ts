import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  LanguageDto,
  CreateLanguageDto,
} from '../types/TekstilTypes';

class TekstilLanguageService {
  /**
   * Get all languages (public)
   */
  async getAllLanguages(): Promise<{ success: boolean; data: LanguageDto[] }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }

      const result: LanguageDto[] = await response.json();
      return {
        success: true,
        data: result || [],
      };
    } catch (error) {
      console.error('Error fetching languages:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get language by ID (public)
   */
  async getLanguageById(id: number): Promise<{ success: boolean; data: LanguageDto | null }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: null,
          };
        }
        throw new Error('Failed to fetch language');
      }

      const result: LanguageDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching language:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get language by code (public)
   */
  async getLanguageByCode(code: string): Promise<{ success: boolean; data: LanguageDto | null }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}/by-code/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: null,
          };
        }
        throw new Error('Failed to fetch language');
      }

      const result: LanguageDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching language:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get default language (public)
   */
  async getDefaultLanguage(): Promise<{ success: boolean; data: LanguageDto | null }> {
    try {
      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}/default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: null,
          };
        }
        throw new Error('Failed to fetch default language');
      }

      const result: LanguageDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching default language:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Create language (admin only)
   */
  async createLanguage(language: CreateLanguageDto): Promise<{ success: boolean; data: LanguageDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(language),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create language');
      }

      const result: LanguageDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error creating language:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update language (admin only)
   */
  async updateLanguage(id: number, language: Partial<LanguageDto>): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(language),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update language');
      }

      const result: LanguageDto = await response.json();
      return {
        success: true,
      };
    } catch (error) {
      console.error('Error updating language:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete language (admin only)
   */
  async deleteLanguage(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.LANGUAGES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete language');
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting language:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilLanguageService();

