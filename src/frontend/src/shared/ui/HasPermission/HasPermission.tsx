import type { ReactNode } from 'react';
import { useAuthStore } from '../../../entities/User/model/store';

interface HasPermissionProps {
  role?: string;
  roles?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Renders children only when the current user has at least one of the required roles.
 * Usage:
 *   <HasPermission role="Admin">...</HasPermission>
 *   <HasPermission roles={["Admin", "SuperAdmin"]}>...</HasPermission>
 *   <HasPermission role="Admin" fallback={<p>Yetkisiz</p>}>...</HasPermission>
 */
export const HasPermission = ({ role, roles, fallback = null, children }: HasPermissionProps) => {
  const user = useAuthStore(s => s.user);

  if (!user) return <>{fallback}</>;

  const required = roles ?? (role ? [role] : []);
  if (required.length === 0) return <>{children}</>;

  const hasRole = required.some(r => user.roles.includes(r));
  return hasRole ? <>{children}</> : <>{fallback}</>;
};

/**
 * Hook variant — returns true if the current user has at least one of the given roles.
 * Usage:
 *   const canEdit = useHasPermission('Admin');
 *   const canView = useHasPermission(['Admin', 'Viewer']);
 */
export const useHasPermission = (role: string | string[]): boolean => {
  const user = useAuthStore(s => s.user);
  if (!user) return false;
  const required = Array.isArray(role) ? role : [role];
  return required.some(r => user.roles.includes(r));
};
