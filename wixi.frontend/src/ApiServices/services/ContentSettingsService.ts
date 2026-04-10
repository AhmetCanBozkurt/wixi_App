import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';

export interface ContentSettings {
  id?: number;
  footerCompanyDescDe: string;
  footerCompanyDescTr: string;
  footerCompanyDescEn?: string;
  footerCompanyDescAr?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedInUrl?: string;
  aboutMissionText1De: string;
  aboutMissionText1Tr: string;
  aboutMissionText1En?: string;
  aboutMissionText1Ar?: string;
  aboutMissionText2De: string;
  aboutMissionText2Tr: string;
  aboutMissionText2En?: string;
  aboutMissionText2Ar?: string;
  contactPhone: string;
  contactEmail: string;
  addressGermany: string;
  addressTurkeyMersin: string;
  addressTurkeyIstanbul: string;
}

export interface PublicContentSettings {
  footerCompanyDesc: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  aboutMission: {
    text1: string;
    text2: string;
  };
  contact: {
    phone: string;
    email: string;
    addresses: {
      germany: string;
      turkeyMersin: string;
      turkeyIstanbul: string;
    };
  };
}

class ContentSettingsService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Public endpoint (no auth required)
  async getPublicSettings(lang: string = 'de'): Promise<{ success: boolean; settings?: PublicContentSettings; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/v1.0/content-settings?lang=${lang}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Settings not found' };
        }
        throw new Error(`Failed to fetch content settings: ${response.statusText}`);
      }

      // Backend returns PublicContentSettings object directly
      const settings = await response.json() as PublicContentSettings;
      return { success: true, settings };
    } catch (error) {
      console.error('Error fetching content settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Admin endpoint
  async getSettings(): Promise<{ success: boolean; settings?: ContentSettings; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/v1.0/admin/content-settings`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Settings not found' };
        }
        throw new Error(`Failed to fetch content settings: ${response.statusText}`);
      }

      const settings = await response.json();
      return { success: true, settings };
    } catch (error) {
      console.error('Error fetching content settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateSettings(data: Omit<ContentSettings, 'id' | 'updatedAt' | 'updatedBy'>): Promise<{ success: boolean; error?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/v1.0/admin/content-settings`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update content settings: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating content settings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new ContentSettingsService();

