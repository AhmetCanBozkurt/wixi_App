import { API_ROUTES } from '../config/api.config';

const BASE_URL = API_ROUTES.BASE_URL;
const API_VERSION = 'v1.0';

export interface SubmitContactFormDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: {
    germany: string;
    turkeyMersin: string;
    turkeyIstanbul: string;
  };
  workingHours: {
    tr: string;
    en: string;
    es: string;
    fr: string;
    de: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedIn?: string;
  };
}

class CorporateContactService {
  async submitContactForm(
    dto: SubmitContactFormDto
  ): Promise<{ success: boolean; message?: string; data?: { id: number }; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/public/corporate/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit contact form: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, message: result.message, data: result.data };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getContactInfo(): Promise<{ success: boolean; data?: ContactInfo; error?: string }> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/${API_VERSION}/public/corporate/contact/info`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch contact info: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new CorporateContactService();

