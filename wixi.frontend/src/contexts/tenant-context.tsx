import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TenantConfig } from '../config/tenants.config';
import { getCurrentTenant, setCurrentTenant as saveTenant } from '../config/tenants.config';

interface TenantContextType {
  tenant: TenantConfig;
  setTenant: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<TenantConfig>(getCurrentTenant());

  const setTenant = (tenantId: string) => {
    saveTenant(tenantId);
    setTenantState(getCurrentTenant());
  };

  useEffect(() => {
    // Listen for tenant changes
    const handleStorageChange = () => {
      setTenantState(getCurrentTenant());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

