import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type {
  ContactInfoDto,
  CreateContactInfoDto,
  UpdateContactInfoDto,
} from '../types/TekstilTypes';

class TekstilContactInfoService {
  /**
   * Get active contact info (public)
   */
  async getActiveContactInfo(lang?: string): Promise<{ success: boolean; data: ContactInfoDto | null }> {
    try {
      const url = lang 
        ? `${API_ROUTES.TEKSTIL.CONTACT_INFO}?lang=${lang}` 
        : API_ROUTES.TEKSTIL.CONTACT_INFO;

      const response = await fetch(url, {
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
        throw new Error('Failed to fetch contact info');
      }

      const result: ContactInfoDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get contact info by ID (admin only)
   */
  async getContactInfoById(id: number, lang?: string): Promise<{ success: boolean; data: ContactInfoDto | null }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const url = lang 
        ? `${API_ROUTES.TEKSTIL.CONTACT_INFO}/${id}?lang=${lang}` 
        : `${API_ROUTES.TEKSTIL.CONTACT_INFO}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: true,
            data: null,
          };
        }
        throw new Error('Failed to fetch contact info');
      }

      const result: ContactInfoDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Create contact info (admin only)
   */
  async createContactInfo(contactInfo: CreateContactInfoDto): Promise<{ success: boolean; data: ContactInfoDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_INFO}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contactInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contact info');
      }

      const result: ContactInfoDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error creating contact info:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update contact info (admin only)
   */
  async updateContactInfo(id: number, contactInfo: UpdateContactInfoDto): Promise<{ success: boolean; data: ContactInfoDto | null; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_INFO}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contactInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contact info');
      }

      const result: ContactInfoDto = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error updating contact info:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete contact info (admin only)
   */
  async deleteContactInfo(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await TokenService.getInstance().getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_ROUTES.TEKSTIL.CONTACT_INFO}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete contact info');
      }

      return {
        success: true,
        message: 'Contact info deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting contact info:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default new TekstilContactInfoService();


