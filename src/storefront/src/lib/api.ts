import axios from 'axios';
import { headers } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5181/api/v1/public';

/**
 * Server Component utility to get the tenant slug from headers.
 * Safe to use in 'layout.tsx' and 'page.tsx' (Server Components).
 */
export async function getTenantSlugFromServer() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  // Local development: sebahattin.localhost:3000 -> sebahattin
  if (host.includes('localhost')) {
    const parts = host.split('.');
    if (parts.length > 1) return parts[0];
  }

  // Fallback to env or default
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'sebahattin';
}

/**
 * Server-side API fetcher.
 * Automatically adds the X-Tenant-Slug header.
 */
export async function fetchServerApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const tenantSlug = await getTenantSlugFromServer();
  
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'X-Tenant-Slug': tenantSlug,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }

  return res.json();
}
