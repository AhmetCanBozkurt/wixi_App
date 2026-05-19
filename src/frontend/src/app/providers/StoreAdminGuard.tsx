import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../entities/User/model/store';

export const StoreAdminGuard = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/store-admin/login" replace />;
  }

  // If we are authenticated but user profile isn't loaded yet, show a simple loader or nothing
  // to avoid premature redirection to "/"
  if (!user) {
    return <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-main)',
      color: 'var(--text-main)' 
    }}>Oturum doğrulanıyor...</div>;
  }

  // Mağaza paneli yalnızca TenantAdmin veya SuperAdmin için (roller JWT /auth/me ile tutarlı olmalı)
  if (user.roles?.includes('SuperAdmin') || user.roles?.includes('TenantAdmin')) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};
