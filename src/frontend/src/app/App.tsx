import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from './providers/AuthGuard';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
import { ApplicationLogsPage } from '../pages/ApplicationLogsPage/ApplicationLogsPage';
import { LanguageManagementPage } from '../pages/LanguageManagementPage/LanguageManagementPage';
import { MenuManagementPage } from '../pages/MenuManagementPage/MenuManagementPage';
import { UserManagementPage } from '../pages/UserManagementPage/UserManagementPage';
import { AuditLogPage } from '../pages/AuditLogPage/AuditLogPage';
import { ComponentShowcasePage } from '../pages/ComponentShowcasePage/ComponentShowcasePage';
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
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<DashboardPage />}>
              <Route index element={<DashboardHome />} />
              <Route path="admin/logs" element={<ApplicationLogsPage />} />
              <Route path="admin/languages" element={<LanguageManagementPage />} />
              <Route path="admin/menus" element={<MenuManagementPage />} />
               <Route path="admin/users" element={<UserManagementPage />} />
              <Route path="admin/audit" element={<AuditLogPage />} />
              <Route path="admin/ui-showcase" element={<ComponentShowcasePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
