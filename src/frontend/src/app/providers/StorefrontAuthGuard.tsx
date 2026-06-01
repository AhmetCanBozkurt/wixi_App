import { useEffect, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerStore } from '../../entities/Customer/model/store';

interface StorefrontAuthGuardProps {
  children: ReactNode;
}

export const StorefrontAuthGuard = ({ children }: StorefrontAuthGuardProps) => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { isAuthenticated, hydrate } = useCustomerStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (tenantSlug) {
      hydrate(tenantSlug);
    }
  }, [tenantSlug, hydrate]);

  useEffect(() => {
    if (tenantSlug && !isAuthenticated) {
      navigate(`/store/${tenantSlug}/login`);
    }
  }, [isAuthenticated, tenantSlug, navigate]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
};
