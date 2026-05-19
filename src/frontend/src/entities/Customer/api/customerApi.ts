import sfClient, { setSfTenant } from '../../../shared/api/storefrontApiClient';
import type { Customer } from '../model/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  customer: Customer;
}

export const customerApi = {
  register: (tenantSlug: string, data: RegisterRequest) => {
    setSfTenant(tenantSlug);
    return sfClient.post<{ message: string; id: string }>('/public/storefront/auth/register', data);
  },

  login: (tenantSlug: string, data: LoginRequest) => {
    setSfTenant(tenantSlug);
    return sfClient.post<LoginResponse>('/public/storefront/auth/login', data);
  },

  me: () => sfClient.get<Customer>('/public/storefront/auth/me'),

  forgotPassword: (tenantSlug: string, data: { email: string }) => {
    setSfTenant(tenantSlug);
    return sfClient.post('/public/storefront/auth/forgot-password', data);
  },

  resetPassword: (tenantSlug: string, data: { token: string; newPassword: string }) => {
    setSfTenant(tenantSlug);
    return sfClient.post('/public/storefront/auth/reset-password', data);
  },

  updateProfile: (tenantSlug: string, data: { firstName: string; lastName: string; phoneNumber?: string }) => {
    setSfTenant(tenantSlug);
    return sfClient.patch('/public/storefront/auth/profile', data);
  },
};
