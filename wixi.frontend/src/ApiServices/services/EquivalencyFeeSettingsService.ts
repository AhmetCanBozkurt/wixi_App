import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

export interface EquivalencyFeeSettingsDto {
  id?: number;
  amount: number;
  currency: string;
  whyPayTitleTr: string;
  whyPayTitleDe?: string;
  whyPayTitleEn?: string;
  whyPayTitleAr?: string;
  whyPayDescriptionTr: string;
  whyPayDescriptionDe?: string;
  whyPayDescriptionEn?: string;
  whyPayDescriptionAr?: string;
  whyProcessTitleTr: string;
  whyProcessTitleDe?: string;
  whyProcessTitleEn?: string;
  whyProcessTitleAr?: string;
  whyProcessItemsTr: string[];
  whyProcessItemsDe?: string[];
  whyProcessItemsEn?: string[];
  whyProcessItemsAr?: string[];
  feeScopeTitleTr: string;
  feeScopeTitleDe?: string;
  feeScopeTitleEn?: string;
  feeScopeTitleAr?: string;
  feeScopeItemsTr: string[];
  feeScopeItemsDe?: string[];
  feeScopeItemsEn?: string[];
  feeScopeItemsAr?: string[];
  noteTr?: string;
  noteDe?: string;
  noteEn?: string;
  noteAr?: string;
  paymentSummaryTitleTr: string;
  paymentSummaryTitleDe?: string;
  paymentSummaryTitleEn?: string;
  paymentSummaryTitleAr?: string;
  paymentSummaryDescriptionTr: string;
  paymentSummaryDescriptionDe?: string;
  paymentSummaryDescriptionEn?: string;
  paymentSummaryDescriptionAr?: string;
  feeItemDescriptionTr: string;
  feeItemDescriptionDe?: string;
  feeItemDescriptionEn?: string;
  feeItemDescriptionAr?: string;
  isActive: boolean;
}

class EquivalencyFeeSettingsService {
  private tokenService = TokenService.getInstance();

  private async getAuthHeader() {
    const token = await this.tokenService.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Admin endpoints
  async getSettings(): Promise<EquivalencyFeeSettingsDto> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/equivalency-fee-settings`,
        {
          headers: await this.getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new Error('Ayarlar alınamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching equivalency fee settings:', error);
      throw error;
    }
  }

  async updateSettings(data: EquivalencyFeeSettingsDto): Promise<EquivalencyFeeSettingsDto> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/admin/equivalency-fee-settings`,
        {
          method: 'PUT',
          headers: await this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Ayarlar güncellenemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating equivalency fee settings:', error);
      throw error;
    }
  }

  // Public endpoints
  async getPublicSettings(): Promise<EquivalencyFeeSettingsDto> {
    try {
      const response = await fetch(
        `${API_ROUTES.BASE_URL}/api/v1.0/equivalency-fee-settings`
      );

      if (!response.ok) {
        throw new Error('Ayarlar alınamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching public equivalency fee settings:', error);
      throw error;
    }
  }
}

const equivalencyFeeSettingsService = new EquivalencyFeeSettingsService();
export default equivalencyFeeSettingsService;

