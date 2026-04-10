import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  StatDto,
  CreateStatDto,
  UpdateStatDto,
} from '../types/TekstilTypes';

class TekstilStatsService {
  /**
   * Get all stats (public)
   */
  async getAllStats(lang?: string): Promise<{ success: boolean; data: StatDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.STATS}?lang=${lang}` 
        : API_ROUTES.TEKSTIL.STATS;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const result: StatDto[] = await response.json();
      return {
        success: true,
        data: result || [],
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get active stats (public)
   */
  async getActiveStats(lang?: string): Promise<{ success: boolean; data: StatDto[] }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.STATS}/active?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.STATS}/active`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active stats');
      }

      const result: StatDto[] = await response.json();
      return {
        success: true,
        data: result || [],
      };
    } catch (error) {
      console.error('Error fetching active stats:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Get stat by ID (public)
   */
  async getStatById(id: number, lang?: string): Promise<{ success: boolean; data: StatDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.STATS}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.STATS}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stat');
      }

      const result: StatDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching stat:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Create stat (admin only)
   */
  async createStat(stat: CreateStatDto): Promise<{ success: boolean; data: StatDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.STATS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(stat),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create stat');
      }

      const result: StatDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error creating stat:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update stat (admin only)
   */
  async updateStat(id: number, stat: UpdateStatDto): Promise<{ success: boolean; data: StatDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.STATS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(stat),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update stat');
      }

      const result: StatDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error updating stat:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete stat (admin only)
   */
  async deleteStat(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.STATS}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stat');
      }

      return {
        success: true,
        message: 'Stat deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting stat:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilStatsService();

