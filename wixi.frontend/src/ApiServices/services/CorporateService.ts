import { API_ROUTES } from '../config/api.config';

const BASE_URL = API_ROUTES.BASE_URL;
const API_VERSION = 'v1.0';

export interface CorporateStats {
  totalProjects: number;
  totalClients: number;
  totalTestimonials: number;
  totalTeamMembers: number;
  yearsOfExperience: number;
  activeUsers: number;
}

export interface Service {
  id: number;
  key: string;
  name: {
    tr: string;
    en: string;
    es: string;
    fr: string;
    de: string;
  };
  description: {
    tr: string;
    en: string;
    es: string;
    fr: string;
    de: string;
  };
  icon: string;
  features: string[];
}

export interface Solution {
  id: number;
  key: string;
  name: {
    tr: string;
    en: string;
    es: string;
    fr: string;
    de: string;
  };
  description: {
    tr: string;
    en: string;
    es: string;
    fr: string;
    de: string;
  };
  icon: string;
  features: string[];
}

class CorporateService {
  async getStats(): Promise<{ success: boolean; data?: CorporateStats; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/public/corporate/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching corporate stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getServices(): Promise<{ success: boolean; data?: Service[]; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/public/corporate/services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching services:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSolutions(): Promise<{ success: boolean; data?: Solution[]; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/public/corporate/solutions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch solutions: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching solutions:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new CorporateService();

