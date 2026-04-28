import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from './providers/AuthGuard';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { ApplicationLogsPage } from '../pages/ApplicationLogsPage/ApplicationLogsPage';
import { LanguageManagementPage } from '../pages/LanguageManagementPage/LanguageManagementPage';
import { MenuManagementPage } from '../pages/MenuManagementPage/MenuManagementPage';
import { UserManagementPage } from '../pages/UserManagementPage/UserManagementPage';
import { RoleManagementPage } from '../pages/RoleManagementPage/RoleManagementPage';
import { AuditLogPage } from '../pages/AuditLogPage/AuditLogPage';
import { ComponentShowcasePage } from '../pages/ComponentShowcasePage/ComponentShowcasePage';
import { MailingManagementPage } from '../features/MailingManagement/pages/MailingManagementPage';
import { ECommerceProductsPage } from '../pages/ECommerceProductsPage/ECommerceProductsPage';
import { ECommerceCategoriesPage } from '../pages/ECommerceCategoriesPage/ECommerceCategoriesPage';
import { ECommerceBrandsPage } from '../pages/ECommerceBrandsPage/ECommerceBrandsPage';
import { ECommerceTenantsPage } from '../pages/ECommerceTenantsPage/ECommerceTenantsPage';
import { MasterStorefrontPage } from '../pages/MasterStorefrontPage/MasterStorefrontPage';
import { useAuthStore } from '../entities/User/model/store';

const DashboardHome = () => {
  const { user } = useAuthStore();
  return (
    <div style={{ background: 'var(--surface-glass)', padding: '30px', borderRadius: 'var(--radius-md)', maxWidth: '600px', border: '1px solid var(--border-glass)' }}>
      <h2 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>Sisteme Hoş Geldiniz, {user?.email}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Yetkileriniz: <strong>{user?.roles?.join(', ')}</strong></p>
      <div style={{ display: 'inline-block', background: 'var(--color-success)', color: '#fff', fontSize: '0.8rem', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 600 }}>SİSTEM ÇEVRİMİÇİ</div>
    </div>
  );
};

const App = () => {
  const isMasterDomain = () => {
    const host = window.location.hostname;
    // Localhost veya ana domain kontrolü
    return host === 'localhost' || host === '127.0.0.1' || host === 'wixi.com';
  };

  return (
    <>
      <Toaster 
        position="top-center" 
        containerStyle={{
          zIndex: 999999,
        }}
        toastOptions={{
          style: {
            zIndex: 999999,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isMasterDomain() ? <MasterStorefrontPage /> : <Navigate to="/admin" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/admin" element={<DashboardPage />}>
              <Route index element={<DashboardHome />} />
              <Route path="logs" element={<ApplicationLogsPage />} />
              <Route path="languages" element={<LanguageManagementPage />} />
              <Route path="menus" element={<MenuManagementPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="roles" element={<RoleManagementPage />} />
              <Route path="audit" element={<AuditLogPage />} />
              <Route path="mailing" element={<MailingManagementPage />} />
              <Route path="ui-showcase" element={<ComponentShowcasePage />} />
              <Route path="ecommerce/tenants" element={<ECommerceTenantsPage />} />
              <Route path="ecommerce/products" element={<ECommerceProductsPage />} />
              <Route path="ecommerce/categories" element={<ECommerceCategoriesPage />} />
              <Route path="ecommerce/brands" element={<ECommerceBrandsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
