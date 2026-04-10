import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../ApiServices/services/AuthService';
import { TokenService } from '../../ApiServices/services/TokenService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const tokenService = TokenService.getInstance();

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await tokenService.getToken(true);
        if (!token) {
          setIsAuthenticated(false);
          setHasAccess(false);
          return;
        }

        setIsAuthenticated(true);

        // If no specific roles are required, just check authentication
        if (allowedRoles.length === 0) {
          setHasAccess(true);
          return;
        }

        // Decode token to get user roles
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRoles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        // Handle single role (string) or multiple roles (array), or null/undefined
        const rolesArray = userRoles 
          ? (Array.isArray(userRoles) ? userRoles : [userRoles])
          : [];
        
        // Check if user has any of the allowed roles
        const hasPermission = rolesArray.length > 0 && allowedRoles.some((role) => rolesArray.includes(role));
        
        if (!hasPermission) {
          console.warn('Access denied. User roles:', rolesArray, 'Allowed roles:', allowedRoles);
        }
        
        setHasAccess(hasPermission);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setHasAccess(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isAuthenticated === null || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

