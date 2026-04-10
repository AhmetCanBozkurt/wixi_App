import { BASE_URL } from "../config/api.config";
import { TokenService } from "./TokenService";

export interface RoleDto { id: number; name: string }
export interface UserDto { 
  id: number; 
  userName: string; 
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export const RoleService = {
  async listRoles(): Promise<RoleDto[]> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/roles`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load roles");
    return res.json();
  },
  async createRole(name: string): Promise<void> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create role");
  },
  async listUsers(): Promise<UserDto[]> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/roles/users`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load users");
    return res.json();
  },
  async createUser(payload: { email: string; password: string; firstName?: string; lastName?: string; role?: string }): Promise<UserDto> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || "Kullanıcı oluşturulamadı";
      const errors = errorData.errors;
      let errorMessage = message;
      if (errors && typeof errors === 'object') {
        const errorList = Object.entries(errors)
          .flatMap(([key, value]: [string, any]) => Array.isArray(value) ? value : [value])
          .filter(Boolean)
          .join(', ');
        if (errorList) errorMessage = `${message}: ${errorList}`;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },
  async assign(userId: number, role: string): Promise<void> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/roles/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) throw new Error("Failed to assign role");
  },
  async remove(userId: number, role: string): Promise<void> {
    const token = await TokenService.getInstance().getToken();
    const res = await fetch(`${BASE_URL}/api/v1.0/admin/roles/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      credentials: "include",
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) throw new Error("Failed to remove role");
  },
};


