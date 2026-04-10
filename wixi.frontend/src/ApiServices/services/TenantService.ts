import { API_ROUTES } from '../config/api.config';
import { TokenService } from './TokenService';
import type { TenantDto, CreateTenantDto, UpdateTenantDto } from '../types/LicensingTypes';

const BASE_URL = API_ROUTES.BASE_URL;
const API_VERSION = 'v1.0';

class TenantService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const tokenService = TokenService.getInstance();
    const token = await tokenService.getToken(true);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllTenants(): Promise<{ success: boolean; data?: TenantDto[]; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/tenants`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenants: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getTenantById(id: number): Promise<{ success: boolean; data?: TenantDto; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/tenants/${id}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Tenant not found' };
        }
        throw new Error(`Failed to fetch tenant: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createTenant(dto: CreateTenantDto): Promise<{ success: boolean; data?: TenantDto; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/tenants`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create tenant: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error creating tenant:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateTenant(id: number, dto: UpdateTenantDto): Promise<{ success: boolean; data?: TenantDto; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/tenants/${id}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update tenant: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error updating tenant:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteTenant(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BASE_URL}/api/${API_VERSION}/tenants/${id}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete tenant: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default new TenantService();

