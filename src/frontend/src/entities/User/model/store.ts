import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import type { User } from './types';
import { apiClient } from '../../../shared/api/axiosConfig';

/** .NET JWT uses full claim type URIs; browsers must read these keys, not shorthand `role` / `nameid`. */
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const CLAIM_NAME_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

function readRolesFromPayload(payload: Record<string, unknown>): string[] {
  const raw = payload.role ?? payload[CLAIM_ROLE];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.length > 0) return [raw];
  return [];
}

function readStringClaim(payload: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = payload[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return '';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const payload = jwtDecode<Record<string, unknown>>(token);
      const roles = readRolesFromPayload(payload);
      const id = readStringClaim(payload, 'nameid', 'sub', CLAIM_NAME_ID);
      const email = readStringClaim(payload, 'email', CLAIM_EMAIL);
      const tenantSlugFromJwt =
        typeof payload.tenant_slug === 'string' && payload.tenant_slug.length > 0
          ? payload.tenant_slug
          : undefined;

      const user: User = {
        id,
        email,
        firstName: '',
        lastName: '',
        roles,
        tenantSlug: tenantSlugFromJwt,
      };

      if (tenantSlugFromJwt) {
        localStorage.setItem('wixi-active-tenant', tenantSlugFromJwt);
      }

      set({ token, user, isAuthenticated: true });

      // Perform full profile hydration
      await get().fetchMe();
    } catch {
      set({ token, user: null, isAuthenticated: true });
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await apiClient.get<{
        firstName: string;
        lastName: string;
        profilePicture?: string;
        tenantSlug?: string;
        tenantName?: string;
        roles?: string[];
      }>('auth/me');
      const currentUser = get().user;
      if (currentUser) {
        const mergedRoles =
          res.data.roles && res.data.roles.length > 0 ? res.data.roles : currentUser.roles;
        const nextSlug = res.data.tenantSlug ?? currentUser.tenantSlug;
        if (nextSlug) {
          localStorage.setItem('wixi-active-tenant', nextSlug);
        } else {
          localStorage.removeItem('wixi-active-tenant');
        }
        set({
          user: {
            ...currentUser,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            profilePicture: res.data.profilePicture,
            tenantSlug: res.data.tenantSlug ?? currentUser.tenantSlug,
            tenantName: res.data.tenantName ?? currentUser.tenantName,
            roles: mergedRoles,
          },
        });
      }
    } catch {
      // silent — profile hydration failure is non-critical
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('wixi-active-tenant');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));

// Hydrate on initial load
const initialToken = localStorage.getItem('token');
if (initialToken) {
  useAuthStore.getState().login(initialToken);
}
