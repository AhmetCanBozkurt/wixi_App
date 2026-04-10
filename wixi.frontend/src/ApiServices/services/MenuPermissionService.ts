import { BASE_URL } from '../config/api.config';
import { TokenService } from './TokenService';
import type { 
  MenuPermissionDto, 
  CreateMenuPermissionDto, 
  UpdateMenuPermissionDto,
  MenuPermissionByUserDto,
  BulkUpdateMenuPermissionsDto,
  MenuPermissionItemDto
} from '../types/MenuPermissionTypes';

const menuPermissionService = {
  // Get all menu permissions
  async getAllMenuPermissions(): Promise<MenuPermissionDto[]> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to load menu permissions');
    const data = await response.json();
    return data?.data || data || [];
  },

  // Get menu permissions grouped by user
  async getMenuPermissionsGroupedByUser(): Promise<MenuPermissionByUserDto[]> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/grouped-by-user`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to load menu permissions');
    const data = await response.json();
    return data?.data || data || [];
  },

  // Get menu permissions for a specific user
  async getMenuPermissionsByUserId(userId: number): Promise<MenuPermissionDto[]> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/user/${userId}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to load menu permissions');
    const data = await response.json();
    return data?.data || data || [];
  },

  // Get visible menus for current user
  async getMyVisibleMenus(): Promise<MenuPermissionDto[]> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/my-menus`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to load visible menus');
    const data = await response.json();
    return data?.data || data || [];
  },

  // Get menu permission by ID
  async getMenuPermissionById(id: number): Promise<MenuPermissionDto | null> {
    try {
      const token = await TokenService.getInstance().getToken();
      const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to load menu permission');
      const data = await response.json();
      return data?.data || data || null;
    } catch (error: any) {
      throw error;
    }
  },

  // Create menu permission
  async createMenuPermission(dto: CreateMenuPermissionDto): Promise<MenuPermissionDto> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '' 
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to create menu permission');
    const data = await response.json();
    return data?.data || data;
  },

  // Update menu permission
  async updateMenuPermission(id: number, dto: UpdateMenuPermissionDto): Promise<MenuPermissionDto> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '' 
      },
      credentials: 'include',
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Failed to update menu permission');
    const data = await response.json();
    return data?.data || data;
  },

  // Delete menu permission
  async deleteMenuPermission(id: number): Promise<boolean> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete menu permission');
    return true;
  },

  // Bulk update menu permissions for a user
  async bulkUpdateMenuPermissions(userId: number, menuItems: MenuPermissionItemDto[]): Promise<boolean> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/user/${userId}/bulk`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '' 
      },
      credentials: 'include',
      body: JSON.stringify(menuItems),
    });
    if (!response.ok) throw new Error('Failed to update menu permissions');
    return true;
  },

  // Initialize default menu permissions for a user
  async initializeDefaultMenuPermissions(userId: number): Promise<boolean> {
    const token = await TokenService.getInstance().getToken();
    const response = await fetch(`${BASE_URL}/api/v1.0/admin/menu-permissions/user/${userId}/initialize`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to initialize menu permissions');
    return true;
  }
};

export default menuPermissionService;

