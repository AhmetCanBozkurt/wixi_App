import axios from 'axios';

let currentTenantSlug: string | null = null;

export function setSfTenant(slug: string) {
  currentTenantSlug = slug;
  localStorage.setItem('wixi-storefront-tenant', slug);
}

export function getSfTenant(): string | null {
  return currentTenantSlug || localStorage.getItem('wixi-storefront-tenant');
}

export const sfClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5182/api/v1',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

sfClient.interceptors.request.use((config) => {
  const slug = getSfTenant();
  if (slug) {
    config.headers['X-Tenant-Slug'] = slug;
    const token = localStorage.getItem(`sf-customer-token-${slug}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const lang = localStorage.getItem('lng') || 'tr-TR';
  config.headers['Accept-Language'] = lang;

  return config;
});

sfClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const slug = getSfTenant();
      if (slug) {
        localStorage.removeItem(`sf-customer-token-${slug}`);
        localStorage.removeItem(`sf-customer-data-${slug}`);
      }
      const currentPath = window.location.pathname;
      const tenantMatch = currentPath.match(/\/store\/([^/]+)/);
      const tenantSlug = tenantMatch ? tenantMatch[1] : slug;
      if (tenantSlug) {
        window.location.href = `/store/${tenantSlug}/login`;
      }
    }
    return Promise.reject(error);
  }
);

export default sfClient;
