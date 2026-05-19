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
};
