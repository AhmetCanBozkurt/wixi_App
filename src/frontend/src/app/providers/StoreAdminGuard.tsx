import { Navigate, Outlet } from 'react-router-dom';
import { useStoreAuthStore } from '../../entities/StoreAdmin/model/store';

export const StoreAdminGuard = () => {
  const isAuthenticated = useStoreAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/store-login" replace />;
  }

  return <Outlet />;
};
