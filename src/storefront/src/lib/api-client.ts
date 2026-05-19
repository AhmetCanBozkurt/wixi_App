import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5182/api/v1/public';

/**
 * Client-Side safe Axios instance.
 * Does NOT depend on next/headers.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Client-Side utility to get tenant slug from browser URL.
 */
export function getTenantSlugFromClient() {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'ahmet-test';
  
  const host = window.location.host;
  
  // localhost:3000 -> ahmet-test (default for dev)
  // ahmet-test.localhost:3000 -> ahmet-test
  // customer-slug.wixi.com -> customer-slug
  
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'ahmet-test';
  }
  
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'ahmet-test';
}

// Add interceptor to always inject tenant slug
apiClient.interceptors.request.use((config) => {
  const slug = getTenantSlugFromClient();
  config.headers['X-Tenant-Slug'] = slug;
  return config;
});

