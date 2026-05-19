import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../entities/User/model/store';

export const AuthGuard = () => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

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

    if (user.roles?.includes('TenantAdmin') && user.tenantSlug) {
        // Prevent TenantAdmin from accessing master /admin routes
        return <Navigate to={`/tenant/${user.tenantSlug}`} replace />;
    }

    return <Outlet />;
};
