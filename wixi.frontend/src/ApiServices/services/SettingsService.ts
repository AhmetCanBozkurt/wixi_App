import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';

export interface SystemSettings {
  id?: number;
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  portalUrl?: string;
  supportEmail?: string;
  updatedAt?: string;
  updatedBy?: string;
}

class SettingsService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getSettings(): Promise<{ success: boolean; settings?: SystemSettings; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/v1.0/admin/settings`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Settings not found' };
        }
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const settings = await response.json();
      return { success: true, settings };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateSettings(data: Omit<SystemSettings, 'id' | 'updatedAt' | 'updatedBy'>): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/v1.0/admin/settings`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new SettingsService();

