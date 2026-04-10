import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from './contexts/language-context';
import { Toaster } from './components/ui/toaster';
import { isProd } from './utils/env';
import NotFound from './pages/NotFound';

// Auth imports
import Login from './components/admin/Login';
import ForgotPassword from './components/admin/ForgotPassword';
import Register from './pages/Register';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Users from './components/admin/Users';
import Reports from './components/admin/Reports';
import SmtpSettings from './components/admin/SmtpSettings';
import Settings from './components/admin/Settings';
import ContentManagement from './components/admin/ContentManagement';
import EmailLogs from './components/admin/EmailLogs';
import ApplicationLogs from './components/admin/ApplicationLogs';
import EmailTemplates from './components/admin/EmailTemplates';
import EmployeeSubmissions from './components/admin/EmployeeSubmissions';
import EmployerSubmissions from './components/admin/EmployerSubmissions';
import ContactSubmissions from './components/admin/ContactSubmissions';
import TeamMembers from './components/admin/TeamMembers';
import News from './components/admin/News';
import Translations from './components/admin/Translations';
import Roles from './components/admin/Roles';
import ClientTracking from './components/admin/ClientTracking';
import SupportManagement from './components/admin/SupportManagement';
import FAQManagement from './components/admin/FAQManagement';
import ApplicationManagement from './components/admin/ApplicationManagement';
import DocumentReview from './components/admin/DocumentReview';
import ApplicationTemplateManagement from './components/admin/ApplicationTemplateManagement';
import DocumentTypeManagement from './components/admin/DocumentTypeManagement';
import AppointmentManagement from './pages/Admin/AppointmentManagement';
import AppointmentList from './pages/Admin/AppointmentList';
import HolidayManagement from './pages/Admin/HolidayManagement';
import PaymentList from './pages/Admin/PaymentList';
import MenuPermissionManagement from './pages/Admin/MenuPermissionManagement';
import TestimonialManagement from './pages/Admin/TestimonialManagement';
import ProjectReferenceManagement from './pages/Admin/ProjectReferenceManagement';
import EquivalencyFeeSettingsManagement from './pages/Admin/EquivalencyFeeSettingsManagement';
import TenantManagement from './components/admin/TenantManagement';
// import LicenseManagement from './components/admin/LicenseManagement'; // Old license management - replaced with LicenseKeyEntry
import LicenseKeyEntry from './pages/Admin/LicenseKeyEntry';
import LicenseRouteGuard from './components/LicenseRouteGuard';

// Tekstil Module imports
import LanguageManagement from './pages/Admin/Tekstil/LanguageManagement';
import AboutManagement from './pages/Admin/Tekstil/AboutManagement';
import StatsManagement from './pages/Admin/Tekstil/StatsManagement';
import ProductCategoryManagement from './pages/Admin/Tekstil/ProductCategoryManagement';
import ProductManagement from './pages/Admin/Tekstil/ProductManagement';
import ProjectCategoryManagement from './pages/Admin/Tekstil/ProjectCategoryManagement';
import ProjectManagement from './pages/Admin/Tekstil/ProjectManagement';
import ContactSubmissionManagement from './pages/Admin/Tekstil/ContactSubmissionManagement';
import ContactInfoManagement from './pages/Admin/Tekstil/ContactInfoManagement';

// Tekstil imports (new design)
import TekstilHome from '../clients/tekstil/pages/Home';

function App() {
  const showPreviewOnlyFeatures = !isProd;

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Tekstil Home - Main Route */}
          <Route path="/" element={<TekstilHome />} />

          {/* Corporate Routes (moved to /corporate) - DISABLED FOR TEKSTIL PROJECT */}
          {/* <Route path="/corporate" element={<CorporateLayout />}>
            <Route index element={<CorporateHome />} />
            <Route path="about" element={<CorporateAbout />} />
            <Route path="services" element={<CorporateServices />} />
            <Route path="solutions" element={<CorporateSolutions />} />
            <Route path="references" element={<CorporateReferences />} />
            <Route path="blog" element={<CorporateBlog />} />
            <Route path="blog/:slug" element={<CorporateBlogDetail />} />
            <Route path="contact" element={<CorporateContact />} />
          </Route> */}

          {/* Legacy Public Routes - DISABLED FOR TEKSTIL PROJECT */}
          {/* <Route path="/legacy" element={<Home />} />
          <Route path="legacy/about" element={<About />} />
          <Route path="legacy/contact" element={<Contact />} />
          <Route path="services/work" element={<Work />} />
          <Route path="services/ausbildung" element={<Ausbildung />} />
          <Route path="services/language" element={<Language />} />
          <Route path="services/university" element={<University />} />
          <Route path="team" element={<Team />} />
          <Route path="team/:slug" element={<TeamMember />} />
          <Route path="news/:slug" element={<NewsDetail />} />
          <Route path="fur-arbeitgeber" element={<FurArbeitgeber />} />
          <Route path="fur-arbeitnehmer" element={<FurArbeitnehmer />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="impressum" element={<Impressum />} />
          <Route path="faq" element={<FAQ />} />
          {showPreviewOnlyFeatures && (
            <>
              <Route path="appointment" element={<Appointment />} />
              <Route path="references" element={<References />} />
            </>
          )} */}

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {showPreviewOnlyFeatures && (
            <Route path="/register" element={<Register />} />
          )}

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <LicenseRouteGuard isAdminRoute>
                  <AdminLayout />
                </LicenseRouteGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            {/* DISABLED FOR TEKSTIL PROJECT - Content Management */}
            {/* <Route path="content-management" element={<ContentManagement />} /> */}
            <Route path="smtp-settings" element={<SmtpSettings />} />
            <Route path="email-logs" element={<EmailLogs />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            {/* DISABLED FOR TEKSTIL PROJECT - Applications */}
            {/* <Route path="employee-submissions" element={<EmployeeSubmissions />} /> */}
            {/* <Route path="employer-submissions" element={<EmployerSubmissions />} /> */}
            {/* <Route path="contact-submissions" element={<ContactSubmissions />} /> */}
            <Route path="team-members" element={<TeamMembers />} />
            <Route path="news" element={<News />} />
            <Route path="application-logs" element={<ApplicationLogs />} />
            <Route path="translations" element={<Translations />} />
            <Route path="roles" element={<Roles />} />
            {/* DISABLED FOR TEKSTIL PROJECT - Client Management */}
            {/* <Route path="client-tracking" element={<ClientTracking />} /> */}
            {/* <Route path="support-management" element={<SupportManagement />} /> */}
            {/* <Route path="faq-management" element={<FAQManagement />} /> */}
            {/* <Route path="application-management" element={<ApplicationManagement />} /> */}
            {/* <Route path="application-templates" element={<ApplicationTemplateManagement />} /> */}
            {/* <Route path="document-types" element={<DocumentTypeManagement />} /> */}
            {/* <Route path="document-review" element={<DocumentReview />} /> */}
            {showPreviewOnlyFeatures && (
              <>
                <Route path="appointments" element={<AppointmentManagement />} />
                <Route path="appointments-list" element={<AppointmentList />} />
              </>
            )}
            <Route path="holidays" element={<HolidayManagement />} />
            <Route path="payments" element={<PaymentList />} />
            {/* DISABLED FOR TEKSTIL PROJECT - Testimonials, Project References, Equivalency */}
            {/* <Route path="testimonials" element={<TestimonialManagement />} /> */}
            {/* <Route path="project-references" element={<ProjectReferenceManagement />} /> */}
            
            {/* Tekstil Module Routes */}
            <Route path="tekstil/languages" element={<LanguageManagement />} />
            <Route path="tekstil/about" element={<AboutManagement />} />
            <Route path="tekstil/stats" element={<StatsManagement />} />
            <Route path="tekstil/product-categories" element={<ProductCategoryManagement />} />
            <Route path="tekstil/products" element={<ProductManagement />} />
            <Route path="tekstil/project-categories" element={<ProjectCategoryManagement />} />
            <Route path="tekstil/projects" element={<ProjectManagement />} />
            <Route path="tekstil/contact-submissions" element={<ContactSubmissionManagement />} />
            <Route path="tekstil/contact-info" element={<ContactInfoManagement />} />
            {/* <Route path="equivalency-fee-settings" element={<EquivalencyFeeSettingsManagement />} /> */}
            <Route path="menu-permissions" element={<MenuPermissionManagement />} />
            <Route path="tenants" element={<TenantManagement />} />
            {/* <Route path="licenses" element={<LicenseManagement />} /> */} {/* Old - replaced with license-key */}
            <Route path="license-key" element={<LicenseKeyEntry />} />
          </Route>

          {/* Client Protected Routes - DISABLED FOR TEKSTIL PROJECT */}
          {/* <Route
            path="/client"
            element={
              <ProtectedRoute allowedRoles={['Client', 'Danisan', 'Danışan']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="documents" element={<ClientDocuments />} />
            <Route path="license-info" element={<ClientLicenseInfo />} />
            <Route path="support" element={<ClientSupport />} />
            <Route path="cv-builder" element={<CVBuilder />} />
            <Route path="cv-builder-payment" element={<CVBuilderPayment />} />
            <Route path="equivalency-fee-payment" element={<EquivalencyFeePayment />} />
          </Route> */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </LanguageProvider>
  );
}

export default App;
