import { create } from 'zustand';
import type { Customer } from './types';

interface CustomerState {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, customer: Customer, tenantSlug: string) => void;
  logout: (tenantSlug: string) => void;
  hydrate: (tenantSlug: string) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customer: null,
  token: null,
  isAuthenticated: false,

  login: (token, customer, tenantSlug) => {
    localStorage.setItem(`sf-customer-token-${tenantSlug}`, token);
    localStorage.setItem(`sf-customer-data-${tenantSlug}`, JSON.stringify(customer));
    set({ customer, token, isAuthenticated: true });
  },

  logout: (tenantSlug) => {
    localStorage.removeItem(`sf-customer-token-${tenantSlug}`);
    localStorage.removeItem(`sf-customer-data-${tenantSlug}`);
    set({ customer: null, token: null, isAuthenticated: false });
  },

  hydrate: (tenantSlug) => {
    const token = localStorage.getItem(`sf-customer-token-${tenantSlug}`);
    const dataStr = localStorage.getItem(`sf-customer-data-${tenantSlug}`);
    if (token && dataStr) {
      try {
        const customer = JSON.parse(dataStr) as Customer;
        set({ customer, token, isAuthenticated: true });
      } catch {
        set({ customer: null, token: null, isAuthenticated: false });
      }
    } else {
      set({ customer: null, token: null, isAuthenticated: false });
    }
  },
}));
