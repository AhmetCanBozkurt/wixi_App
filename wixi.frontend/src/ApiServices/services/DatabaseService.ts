import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';

export interface DatabaseStats {
  clients: number;
  documents: number;
  applications: number;
  supportTickets: number;
  users: number;
  emailLogs: number;
  formSubmissions: {
    employee: number;
    employer: number;
    contact: number;
  };
}

export interface CleanupResult {
  success: boolean;
  message: string;
  deleted: {
    supportMessages: number;
    supportTickets: number;
    notifications: number;
    applicationHistories: number;
    applicationSubSteps: number;
    applicationSteps: number;
    applications: number;
    documentReviews: number;
    documents: number;
    fileStorages: number;
    educationInfos: number;
    pendingClientCodes: number;
    clients: number;
    employeeSubmissions: number;
    employerSubmissions: number;
    contactSubmissions: number;
    emailLogs: number;
    userPreferences: number;
    applicationLogs: number;
  };
}

class DatabaseService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getStats(): Promise<DatabaseStats> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.DATABASE.STATS, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch database stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching database stats:', error);
      throw error;
    }
  }

  async cleanupTestData(includeUsers: boolean = false): Promise<CleanupResult> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.DATABASE.CLEANUP_TEST_DATA(includeUsers), {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to cleanup test data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      throw error;
    }
  }

  async cleanupClientData(clientId: number, deleteUser: boolean = false): Promise<{
    success: boolean;
    message: string;
    clientName: string;
    clientCode: string;
    deleted: Record<string, number>;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ROUTES.DATABASE.CLEANUP_CLIENT_DATA(clientId, deleteUser), {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to cleanup client data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cleaning up client data:', error);
      throw error;
    }
  }
}

export default new DatabaseService();

