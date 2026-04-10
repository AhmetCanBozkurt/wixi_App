/**
 * Multi-Tenant Configuration
 * Each tenant has its own client-side UI/UX
 * Admin panel is shared across all tenants
 */

export interface TenantConfig {
  id: string;
  name: string;
  domain?: string;
  clientBasePath: string;
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
}

export const TENANTS: Record<string, TenantConfig> = {
  worklines: {
    id: 'worklines',
    name: 'Worklines',
    clientBasePath: '/client/worklines',
    theme: {
      primaryColor: '#3b82f6',
    },
  },
  tekstil: {
    id: 'tekstil',
    name: 'Tekstil',
    clientBasePath: '/tekstil',
    theme: {
      primaryColor: '#10b981',
    },
  },
};

/**
 * Get tenant by domain or default to worklines
 */
export function getTenantByDomain(hostname: string): TenantConfig {
  // Add domain-based tenant detection here
  // For now, default to worklines
  if (hostname.includes('tekstil')) {
    return TENANTS.tekstil;
  }
  return TENANTS.worklines;
}

/**
 * Get tenant from localStorage or URL parameter
 */
export function getCurrentTenant(): TenantConfig {
  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam && TENANTS[tenantParam]) {
    return TENANTS[tenantParam];
  }

  // Check localStorage
  const storedTenant = localStorage.getItem('selectedTenant');
  if (storedTenant && TENANTS[storedTenant]) {
    return TENANTS[storedTenant];
  }

  // Check domain
  return getTenantByDomain(window.location.hostname);
}

/**
 * Set current tenant
 */
export function setCurrentTenant(tenantId: string): void {
  if (TENANTS[tenantId]) {
    localStorage.setItem('selectedTenant', tenantId);
  }
}

