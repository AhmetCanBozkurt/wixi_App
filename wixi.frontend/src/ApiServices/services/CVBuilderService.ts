import { BASE_URL, API_VERSION } from '../config/api.config';
import { TokenService } from './TokenService';
import type { SaveCVDataDto, CVDataDto, DocumentAnalysisDto } from '../../types/CVBuilderTypes';

class CVBuilderService {
  private static instance: CVBuilderService;
  private tokenService: TokenService;

  private constructor() {
    this.tokenService = TokenService.getInstance();
  }

  public static getInstance(): CVBuilderService {
    if (!CVBuilderService.instance) {
      CVBuilderService.instance = new CVBuilderService();
    }
    return CVBuilderService.instance;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.tokenService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Save CV data
   */
  async saveCVData(data: SaveCVDataDto): Promise<CVDataDto> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/cv-builder/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'CV kaydedilemedi' }));
        throw new Error(error.message || 'CV kaydedilemedi');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      console.error('CV kaydetme hatası:', error);
      throw error;
    }
  }

  /**
   * Get CV data by session ID
   */
  async getCVDataBySessionId(sessionId: string): Promise<CVDataDto | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/cv-builder/session/${sessionId}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('CV verisi alınamadı');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      console.error('CV verisi alma hatası:', error);
      throw error;
    }
  }

  /**
   * Get CV data by payment ID
   */
  async getCVDataByPaymentId(paymentId: number): Promise<CVDataDto | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/cv-builder/payment/${paymentId}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('CV verisi alınamadı');
      }

      const result = await response.json();
      return result.data || result;
    } catch (error: any) {
      console.error('CV verisi alma hatası:', error);
      throw error;
    }
  }

  /**
   * Export CV to PDF
   */
  async exportCVToPdf(sessionId: string): Promise<Blob> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/cv-builder/export/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': headers['Authorization'] as string,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('PDF oluşturulamadı');
      }

      return await response.blob();
    } catch (error: any) {
      console.error('PDF export hatası:', error);
      throw error;
    }
  }

  /**
   * Analyze document for CV detection and ATS score
   */
  async analyzeDocument(documentId: number): Promise<DocumentAnalysisDto> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/documents/${documentId}/analysis`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Belge analiz edilemedi');
      }

      const result = await response.json();
      const analysis = result.data || result;
      // Parse recommendations if it's a JSON string
      if (analysis.recommendations && typeof analysis.recommendations === 'string') {
        try {
          analysis.recommendations = JSON.parse(analysis.recommendations);
        } catch {
          analysis.recommendations = [];
        }
      }
      return analysis;
    } catch (error: any) {
      console.error('Belge analiz hatası:', error);
      throw error;
    }
  }

  /**
   * Get document analysis result
   */
  async getDocumentAnalysis(documentId: number): Promise<DocumentAnalysisDto | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/documents/${documentId}/analysis/result`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        // 404 means analysis doesn't exist yet - this is normal, not an error
        if (response.status === 404) {
          return null;
        }
        // For other errors, try to get error message
        const errorData = await response.json().catch(() => ({ message: 'Analiz sonucu alınamadı' }));
        throw new Error(errorData.message || 'Analiz sonucu alınamadı');
      }

      const result = await response.json();
      const analysis = result.data || result;
      
      // Parse recommendations if it's a JSON string
      if (analysis && analysis.recommendations && typeof analysis.recommendations === 'string') {
        try {
          analysis.recommendations = JSON.parse(analysis.recommendations);
        } catch {
          analysis.recommendations = [];
        }
      }
      return analysis;
    } catch (error: any) {
      // Only throw if it's not a 404 (404 is expected when analysis doesn't exist)
      if (error.message && error.message.includes('404')) {
        return null;
      }
      console.error('Analiz sonucu alma hatası:', error);
      throw error;
    }
  }
}

const cvBuilderService = CVBuilderService.getInstance();
export default cvBuilderService;

