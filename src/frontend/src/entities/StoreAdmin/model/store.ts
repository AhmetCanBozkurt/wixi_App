import { create } from 'zustand';

interface StoreAuthState {
  token: string | null;
  tenantSlug: string | null;
  tenantName: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, tenantSlug: string, tenantName: string, email: string) => void;
  logout: () => void;
}

export const useStoreAuthStore = create<StoreAuthState>((set) => ({
  token: localStorage.getItem('wixi-store-token'),
  tenantSlug: localStorage.getItem('wixi-store-tenant'),
  tenantName: localStorage.getItem('wixi-store-tenant-name'),
  email: localStorage.getItem('wixi-store-email'),
  isAuthenticated: !!localStorage.getItem('wixi-store-token'),

  login: (token: string, tenantSlug: string, tenantName: string, email: string) => {
    localStorage.setItem('wixi-store-token', token);
    localStorage.setItem('wixi-store-tenant', tenantSlug);
    localStorage.setItem('wixi-store-tenant-name', tenantName);
    localStorage.setItem('wixi-store-email', email);
    set({ token, tenantSlug, tenantName, email, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('wixi-store-token');
    localStorage.removeItem('wixi-store-tenant');
    localStorage.removeItem('wixi-store-tenant-name');
    localStorage.removeItem('wixi-store-email');
    set({ token: null, tenantSlug: null, tenantName: null, email: null, isAuthenticated: false });
  },
}));
