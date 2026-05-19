import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from './providers/AuthGuard';
import { StoreAdminGuard } from './providers/StoreAdminGuard';
import { StorefrontAuthGuard } from './providers/StorefrontAuthGuard';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { MasterStorefrontPage } from '../pages/MasterStorefrontPage/MasterStorefrontPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { ApplicationLogsPage } from '../pages/ApplicationLogsPage/ApplicationLogsPage';
import { LanguageManagementPage } from '../pages/LanguageManagementPage/LanguageManagementPage';
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
import { StoreAdminLayout } from '../pages/StoreAdminPage/StoreAdminLayout';
import { StoreAdminLoginPage } from '../pages/StoreAdminLoginPage/StoreAdminLoginPage';
import { StoreDashboardPage } from '../pages/StoreAdminPage/pages/StoreDashboardPage';
import { StoreOrdersPage } from '../pages/StoreAdminPage/pages/StoreOrdersPage';
import { StoreCustomersPage } from '../pages/StoreAdminPage/pages/StoreCustomersPage';
import { StoreSettingsPage } from '../pages/StoreAdminPage/pages/StoreSettingsPage';
import { StoreBillingPage } from '../pages/StoreAdminPage/pages/StoreBillingPage';
import { ThemeEditor } from '../pages/StoreAdminPage/pages/ThemeEditor/ThemeEditor';
import { StoreProductsPage } from '../pages/StoreProductsPage/StoreProductsPage';
import { StoreStockPage } from '../pages/StoreProductsPage/StoreStockPage';
import { StoreWarehouseReportPage } from '../pages/StoreProductsPage/StoreWarehouseReportPage';
import { StoreCategoriesPage } from '../pages/StoreCategoriesPage/StoreCategoriesPage';
import { StoreBrandsPage } from '../pages/StoreBrandsPage/StoreBrandsPage';
import { StoreTestimonialsPage } from '../pages/StoreAdminPage/pages/StoreTestimonialsPage';
import { StorePromoBannersPage } from '../pages/StoreAdminPage/pages/StorePromoBannersPage';
import { StoreSlidersPage } from '../pages/StoreAdminPage/pages/StoreSlidersPage';
import { StoreFaqPage } from '../pages/StoreAdminPage/pages/StoreFaqPage';
import { StoreContactSubmissionsPage } from '../pages/StoreAdminPage/pages/StoreContactSubmissionsPage';
import { StoreCariPage } from '../pages/StoreCariPage/StoreCariPage';
import StoreDiscountsPage from '../pages/StoreDiscountsPage/StoreDiscountsPage';
import StoreAnalyticsPage from '../pages/StoreAnalyticsPage/StoreAnalyticsPage';
import StoreMediaPage from '../pages/StoreMediaPage/StoreMediaPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage/AdminDashboardPage';
import { StorefrontPage } from '../pages/StorefrontPage/StorefrontPage';
import { StorefrontLayout } from '../pages/StorefrontPage/StorefrontLayout';
import { StorefrontLoginPage } from '../pages/StorefrontAuthPage/StorefrontLoginPage';
import { StorefrontRegisterPage } from '../pages/StorefrontAuthPage/StorefrontRegisterPage';
import { StorefrontForgotPasswordPage } from '../pages/StorefrontAuthPage/StorefrontForgotPasswordPage';
import { StorefrontResetPasswordPage } from '../pages/StorefrontAuthPage/StorefrontResetPasswordPage';
import { StorefrontCartPage } from '../pages/StorefrontCartPage/StorefrontCartPage';
import { StorefrontCheckoutPage } from '../pages/StorefrontCheckoutPage/StorefrontCheckoutPage';
import { StorefrontOrderSuccessPage } from '../pages/StorefrontOrderSuccessPage/StorefrontOrderSuccessPage';
import { StorefrontProductDetailPage } from '../pages/StorefrontProductDetailPage/StorefrontProductDetailPage';
import { StorefrontCategoryPage } from '../pages/StorefrontCategoryPage/StorefrontCategoryPage';
import { StorefrontAccountPage } from '../pages/StorefrontAccountPage/StorefrontAccountPage';
import { CRMPage } from '../pages/CRMPage/CRMPage';
import { VisitManagementPage } from '../pages/VisitManagementPage/VisitManagementPage';
import { ProjectManagementPage } from '../pages/ProjectManagementPage/ProjectManagementPage';
import { SupportPage } from '../pages/SupportPage/SupportPage';
import { InventoryPage } from '../pages/InventoryPage/InventoryPage';
import AdminModulesPage from '../pages/AdminModulesPage/AdminModulesPage';
import { DatabaseSchemaPage } from '../pages/DatabaseSchemaPage/DatabaseSchemaPage';
import { AdminThemeManagementPage } from '../pages/AdminThemeManagementPage/AdminThemeManagementPage';
import { AdminTenantThemePage } from '../pages/AdminThemeManagementPage/AdminTenantThemePage';
import { AdminThemeTemplatesPage } from '../pages/AdminThemeManagementPage/AdminThemeTemplatesPage';
import CiktiTasarlamaPage from '../pages/CiktiTasarlamaPage/CiktiTasarlamaPage';

const App = () => {
  return (
    <ThemeProvider>
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
          <Route path="/store-admin/login" element={<StoreAdminLoginPage />} />
          <Route path="/store/:tenantSlug" element={<StorefrontLayout />}>
            <Route index element={<StorefrontPage />} />
            <Route path="product/:slug" element={<StorefrontProductDetailPage />} />
            <Route path="category/:slug" element={<StorefrontCategoryPage />} />
            <Route path="cart" element={<StorefrontCartPage />} />
            <Route path="login" element={<StorefrontLoginPage />} />
            <Route path="register" element={<StorefrontRegisterPage />} />
            <Route path="forgot-password" element={<StorefrontForgotPasswordPage />} />
            <Route path="reset-password" element={<StorefrontResetPasswordPage />} />
            <Route path="checkout" element={<StorefrontAuthGuard><StorefrontCheckoutPage /></StorefrontAuthGuard>} />
            <Route path="order-success/:orderNumber" element={<StorefrontOrderSuccessPage />} />
            <Route path="account" element={<StorefrontAuthGuard><StorefrontAccountPage /></StorefrontAuthGuard>} />
            <Route path=":pageSlug" element={<StorefrontPage />} />
          </Route>
          <Route element={<StoreAdminGuard />}>
            <Route path="/tenant/:tenantSlug" element={<StoreAdminLayout />}>
              <Route index element={<StoreDashboardPage />} />
              <Route path="products" element={<StoreProductsPage />} />
              <Route path="categories" element={<StoreCategoriesPage />} />
              <Route path="brands" element={<StoreBrandsPage />} />
              <Route path="orders" element={<StoreOrdersPage />} />
              <Route path="customers" element={<StoreCustomersPage />} />
              <Route path="settings" element={<StoreSettingsPage />} />
              <Route path="theme-editor" element={<ThemeEditor />} />
              <Route path="billing" element={<StoreBillingPage />} />
              <Route path="testimonials" element={<StoreTestimonialsPage />} />
              <Route path="promo-banners" element={<StorePromoBannersPage />} />
              <Route path="sliders" element={<StoreSlidersPage />} />
              <Route path="faq" element={<StoreFaqPage />} />
              <Route path="contact-submissions" element={<StoreContactSubmissionsPage />} />
              <Route path="stock" element={<StoreStockPage />} />
              <Route path="stock/report" element={<StoreWarehouseReportPage />} />
              <Route path="cari" element={<StoreCariPage />} />
              <Route path="discounts" element={<StoreDiscountsPage />} />
              <Route path="analytics" element={<StoreAnalyticsPage />} />
              <Route path="media" element={<StoreMediaPage />} />
            </Route>
          </Route>
          <Route element={<AuthGuard />}>
            <Route path="/admin" element={<DashboardPage />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="logs" element={<ApplicationLogsPage />} />
              <Route path="languages" element={<LanguageManagementPage />} />
              <Route path="modules" element={<AdminModulesPage />} />
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
              <Route path="crm" element={<CRMPage />} />
              <Route path="visits" element={<VisitManagementPage />} />
              <Route path="projects" element={<ProjectManagementPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="db-schema" element={<DatabaseSchemaPage />} />
              <Route path="theme-management" element={<AdminThemeManagementPage />} />
              <Route path="theme-management/stores/:tenantId" element={<AdminTenantThemePage />} />
              <Route path="theme-management/templates" element={<AdminThemeTemplatesPage />} />
              <Route path="cikti-tasarlama" element={<CiktiTasarlamaPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
