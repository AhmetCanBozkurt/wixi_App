import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from './providers/AuthGuard';
import { StoreAdminGuard } from './providers/StoreAdminGuard';
import { StorefrontAuthGuard } from './providers/StorefrontAuthGuard';
import { LoginPage } from '../pages/auth/LoginPage/LoginPage';
import { MasterStorefrontPage } from '../pages/storefront/MasterStorefrontPage/MasterStorefrontPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage/ResetPasswordPage';
import { DashboardPage } from '../pages/admin/DashboardPage/DashboardPage';
import { ApplicationLogsPage } from '../pages/admin/ApplicationLogsPage/ApplicationLogsPage';
import { LanguageManagementPage } from '../pages/admin/LanguageManagementPage/LanguageManagementPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage/UserManagementPage';
import { RoleManagementPage } from '../pages/admin/RoleManagementPage/RoleManagementPage';
import { AuditLogPage } from '../pages/admin/AuditLogPage/AuditLogPage';
import { ComponentShowcasePage } from '../pages/admin/ComponentShowcasePage/ComponentShowcasePage';
import { MailingManagementPage } from '../features/MailingManagement/pages/MailingManagementPage';
import { CurrencyManagementPage } from '../pages/admin/CurrencyManagementPage/CurrencyManagementPage';
import { ExchangeRatePage } from '../pages/admin/ExchangeRatePage/ExchangeRatePage';
import { CurrencySettingsPage } from '../pages/admin/CurrencySettingsPage/CurrencySettingsPage';
import { ECommerceTenantsPage } from '../pages/ecommerce/ECommerceTenantsPage/ECommerceTenantsPage';
import { ECommerceProductsPage } from '../pages/ecommerce/ECommerceProductsPage/ECommerceProductsPage';
import { ECommerceCategoriesPage } from '../pages/ecommerce/ECommerceCategoriesPage/ECommerceCategoriesPage';
import { ECommerceBrandsPage } from '../pages/ecommerce/ECommerceBrandsPage/ECommerceBrandsPage';
import { CheckoutSuccessPage } from '../pages/storefront/CheckoutSuccessPage/CheckoutSuccessPage';
import { CheckoutCancelPage } from '../pages/storefront/CheckoutCancelPage/CheckoutCancelPage';
import { StoreAdminLayout } from '../pages/store-admin/StoreAdminPage/StoreAdminLayout';
import { StoreAdminLoginPage } from '../pages/auth/StoreAdminLoginPage/StoreAdminLoginPage';
import { StoreDashboardPage } from '../pages/store-admin/StoreAdminPage/pages/StoreDashboardPage';
import { StoreOrdersPage } from '../pages/store-admin/StoreAdminPage/pages/StoreOrdersPage';
import { StoreCustomersPage } from '../pages/store-admin/StoreAdminPage/pages/StoreCustomersPage';
import { StoreSettingsPage } from '../pages/store-admin/StoreAdminPage/pages/StoreSettingsPage';
import { StoreBillingPage } from '../pages/store-admin/StoreAdminPage/pages/StoreBillingPage';
import { ThemeEditor } from '../features/ThemeBuilder/ThemeEditor';
import { StoreProductsPage } from '../pages/store-admin/StoreProductsPage/StoreProductsPage';
import { StoreStockPage } from '../pages/store-admin/StoreProductsPage/StoreStockPage';
import { StoreWarehouseReportPage } from '../pages/store-admin/StoreProductsPage/StoreWarehouseReportPage';
import { StoreCategoriesPage } from '../pages/store-admin/StoreCategoriesPage/StoreCategoriesPage';
import { StoreBrandsPage } from '../pages/store-admin/StoreBrandsPage/StoreBrandsPage';
import { StoreTestimonialsPage } from '../pages/store-admin/StoreAdminPage/pages/StoreTestimonialsPage';
import { StorePromoBannersPage } from '../pages/store-admin/StoreAdminPage/pages/StorePromoBannersPage';
import { StoreSlidersPage } from '../pages/store-admin/StoreAdminPage/pages/StoreSlidersPage';
import { StoreFaqPage } from '../pages/store-admin/StoreAdminPage/pages/StoreFaqPage';
import { StoreContactSubmissionsPage } from '../pages/store-admin/StoreAdminPage/pages/StoreContactSubmissionsPage';
import { StoreCariPage } from '../pages/store-admin/StoreCariPage/StoreCariPage';
import StoreDiscountsPage from '../pages/store-admin/StoreDiscountsPage/StoreDiscountsPage';
import StoreAnalyticsPage from '../pages/store-admin/StoreAnalyticsPage/StoreAnalyticsPage';
import StoreMediaPage from '../pages/store-admin/StoreMediaPage/StoreMediaPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage/AdminDashboardPage';
import { StorefrontPage } from '../pages/storefront/StorefrontPage/StorefrontPage';
import { StorefrontLayout } from '../pages/storefront/StorefrontPage/StorefrontLayout';
import { StorefrontLoginPage } from '../pages/auth/StorefrontAuthPage/StorefrontLoginPage';
import { StorefrontRegisterPage } from '../pages/auth/StorefrontAuthPage/StorefrontRegisterPage';
import { StorefrontForgotPasswordPage } from '../pages/auth/StorefrontAuthPage/StorefrontForgotPasswordPage';
import { StorefrontResetPasswordPage } from '../pages/auth/StorefrontAuthPage/StorefrontResetPasswordPage';
import { StorefrontCartPage } from '../pages/storefront/StorefrontCartPage/StorefrontCartPage';
import { StorefrontCheckoutPage } from '../pages/storefront/StorefrontCheckoutPage/StorefrontCheckoutPage';
import { StorefrontOrderSuccessPage } from '../pages/storefront/StorefrontOrderSuccessPage/StorefrontOrderSuccessPage';
import { StorefrontProductDetailPage } from '../pages/storefront/StorefrontProductDetailPage/StorefrontProductDetailPage';
import { StorefrontCategoryPage } from '../pages/storefront/StorefrontCategoryPage/StorefrontCategoryPage';
import { StorefrontAccountPage } from '../pages/storefront/StorefrontAccountPage/StorefrontAccountPage';
import { CRMPage } from '../pages/admin/CRMPage/CRMPage';
import { VisitManagementPage } from '../pages/admin/VisitManagementPage/VisitManagementPage';
import { ProjectManagementPage } from '../pages/admin/ProjectManagementPage/ProjectManagementPage';
import { SupportPage } from '../pages/admin/SupportPage/SupportPage';
import { InventoryPage } from '../pages/admin/InventoryPage/InventoryPage';
import AdminModulesPage from '../pages/admin/AdminModulesPage/AdminModulesPage';
import { DatabaseSchemaPage } from '../pages/admin/DatabaseSchemaPage/DatabaseSchemaPage';
import { AdminThemeManagementPage } from '../pages/admin/AdminThemeManagementPage/AdminThemeManagementPage';
import { AdminTenantThemePage } from '../pages/admin/AdminThemeManagementPage/AdminTenantThemePage';
import { AdminThemeTemplatesPage } from '../pages/admin/AdminThemeManagementPage/AdminThemeTemplatesPage';
import CiktiTasarlamaPage from '../pages/admin/CiktiTasarlamaPage/CiktiTasarlamaPage';
import { SystemPagesPage } from '../pages/admin/DefinitionsPage/SystemPagesPage';
import { RegionsPage } from '../pages/admin/DefinitionsPage/RegionsPage';
import { PortsPage } from '../pages/admin/DefinitionsPage/PortsPage';
import { PaymentTermsPage } from '../pages/admin/DefinitionsPage/PaymentTermsPage';
import { TaxOfficesPage } from '../pages/admin/DefinitionsPage/TaxOfficesPage';
import { IncotermsPage } from '../pages/admin/DefinitionsPage/IncotermsPage';
import { TransportModesPage } from '../pages/admin/DefinitionsPage/TransportModesPage';
import { PackageTypesPage } from '../pages/admin/DefinitionsPage/PackageTypesPage';
import { UnitCategoriesPage } from '../pages/admin/DefinitionsPage/UnitCategoriesPage';
import { UnitsPage } from '../pages/admin/DefinitionsPage/UnitsPage';
import { UnitConversionsPage } from '../pages/admin/DefinitionsPage/UnitConversionsPage';
import { ServiceCategoriesPage } from '../pages/admin/DefinitionsPage/ServiceCategoriesPage';
import { ServicesPage } from '../pages/admin/DefinitionsPage/ServicesPage';
import { ProductDescriptionsPage } from '../pages/admin/DefinitionsPage/ProductDescriptionsPage';
import { HsCodesPage } from '../pages/admin/DefinitionsPage/HsCodesPage';
import { SystemOverviewPage } from '../pages/admin/SystemOverviewPage/SystemOverviewPage';
import WebBuilderEditorPage from '../pages/corporate/WebBuilderEditorPage/WebBuilderEditorPage';
import BlogManagementPage from '../pages/corporate/BlogManagementPage/BlogManagementPage';
import FormManagementPage from '../pages/corporate/FormManagementPage/FormManagementPage';
import { MyFinanceLayout } from '../pages/my-finance/MyFinanceLayout/MyFinanceLayout';
import { PersonalFinanceDashboardPage } from '../pages/my-finance/PersonalFinanceDashboardPage/PersonalFinanceDashboardPage';
import { TransactionsPage } from '../pages/my-finance/TransactionsPage/TransactionsPage';
import { BudgetsPage } from '../pages/my-finance/BudgetsPage/BudgetsPage';
import { CategoriesPage } from '../pages/my-finance/CategoriesPage/CategoriesPage';

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
            <Route path="/corp/builder" element={<WebBuilderEditorPage />} />
            <Route path="/my-finance" element={<MyFinanceLayout />}>
              <Route index element={<PersonalFinanceDashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>
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
              <Route path="theme-management/editor/:tenantSlug" element={<ThemeEditor />} />
              <Route path="cikti-tasarlama" element={<CiktiTasarlamaPage />} />
              <Route path="definitions/system-pages" element={<SystemPagesPage />} />
              <Route path="definitions/regions" element={<RegionsPage />} />
              <Route path="definitions/ports" element={<PortsPage />} />
              <Route path="definitions/payment-terms" element={<PaymentTermsPage />} />
              <Route path="definitions/tax-offices" element={<TaxOfficesPage />} />
              <Route path="definitions/incoterms" element={<IncotermsPage />} />
              <Route path="definitions/transport-modes" element={<TransportModesPage />} />
              <Route path="definitions/package-types" element={<PackageTypesPage />} />
              <Route path="definitions/unit-categories" element={<UnitCategoriesPage />} />
              <Route path="definitions/units" element={<UnitsPage />} />
              <Route path="definitions/unit-conversions" element={<UnitConversionsPage />} />
              <Route path="definitions/service-categories" element={<ServiceCategoriesPage />} />
              <Route path="definitions/services" element={<ServicesPage />} />
              <Route path="definitions/product-descriptions" element={<ProductDescriptionsPage />} />
              <Route path="definitions/hs-codes" element={<HsCodesPage />} />
              <Route path="system-overview" element={<SystemOverviewPage />} />
              <Route path="corp/blog" element={<BlogManagementPage />} />
              <Route path="corp/forms" element={<FormManagementPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
