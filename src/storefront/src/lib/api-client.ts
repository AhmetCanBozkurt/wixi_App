import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api/v1/public';

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
  if (typeof window === 'undefined') return 'sebahattin';
  const host = window.location.host;
  
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length > 1) return parts[0];
  }
  
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'sebahattin';
}

// Add interceptor to always inject tenant slug
apiClient.interceptors.request.use((config) => {
  const slug = getTenantSlugFromClient();
  config.headers['X-Tenant-Slug'] = slug;
  return config;
});

