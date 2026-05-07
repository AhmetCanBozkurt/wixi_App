import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from './providers/AuthGuard';
import { StoreAdminGuard } from './providers/StoreAdminGuard';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { MasterStorefrontPage } from '../pages/MasterStorefrontPage/MasterStorefrontPage';
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
import { CurrencyManagementPage } from '../pages/CurrencyManagementPage/CurrencyManagementPage';
import { ExchangeRatePage } from '../pages/ExchangeRatePage/ExchangeRatePage';
import { CurrencySettingsPage } from '../pages/CurrencySettingsPage/CurrencySettingsPage';
import { ECommerceTenantsPage } from '../pages/ECommerceTenantsPage/ECommerceTenantsPage';
import { ECommerceProductsPage } from '../pages/ECommerceProductsPage/ECommerceProductsPage';
import { ECommerceCategoriesPage } from '../pages/ECommerceCategoriesPage/ECommerceCategoriesPage';
import { ECommerceBrandsPage } from '../pages/ECommerceBrandsPage/ECommerceBrandsPage';
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage/CheckoutSuccessPage';
import { CheckoutCancelPage } from '../pages/CheckoutCancelPage/CheckoutCancelPage';
import { StoreLoginPage } from '../pages/StoreLoginPage/StoreLoginPage';
import { StoreAdminLayout } from '../pages/StoreAdminPage/StoreAdminLayout';
import { StoreDashboardPage } from '../pages/StoreAdminPage/pages/StoreDashboardPage';
import { StoreOrdersPage } from '../pages/StoreAdminPage/pages/StoreOrdersPage';
import { StoreCustomersPage } from '../pages/StoreAdminPage/pages/StoreCustomersPage';
import { StoreSettingsPage } from '../pages/StoreAdminPage/pages/StoreSettingsPage';
import { StoreBillingPage } from '../pages/StoreAdminPage/pages/StoreBillingPage';
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
  return (
    <ErrorBoundary>
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
          <Route path="/" element={<MasterStorefrontPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
          <Route path="/store-login" element={<StoreLoginPage />} />
          <Route element={<StoreAdminGuard />}>
            <Route path="/store" element={<StoreAdminLayout />}>
              <Route index element={<StoreDashboardPage />} />
              <Route path="orders" element={<StoreOrdersPage />} />
              <Route path="customers" element={<StoreCustomersPage />} />
              <Route path="settings" element={<StoreSettingsPage />} />
              <Route path="billing" element={<StoreBillingPage />} />
            </Route>
          </Route>
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
              <Route path="currencies" element={<CurrencyManagementPage />} />
              <Route path="exchange-rates" element={<ExchangeRatePage />} />
              <Route path="currency-settings" element={<CurrencySettingsPage />} />
              <Route path="ecommerce/tenants" element={<ECommerceTenantsPage />} />
              <Route path="ecommerce/products" element={<ECommerceProductsPage />} />
              <Route path="ecommerce/categories" element={<ECommerceCategoriesPage />} />
              <Route path="ecommerce/brands" element={<ECommerceBrandsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
