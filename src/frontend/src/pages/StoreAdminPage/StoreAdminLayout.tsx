import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaStore,
  FaTachometerAlt,
  FaShoppingCart,
  FaUsers,
  FaCog,
  FaFileInvoiceDollar,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useStoreAuthStore } from '../../entities/StoreAdmin/model/store';
import styles from './StoreAdminLayout.module.css';

const navItems = [
  { to: '/store', label: 'Dashboard', icon: <FaTachometerAlt className={styles.navIcon} />, end: true },
  { to: '/store/orders', label: 'Siparişler', icon: <FaShoppingCart className={styles.navIcon} />, end: false },
  { to: '/store/customers', label: 'Müşteriler', icon: <FaUsers className={styles.navIcon} />, end: false },
  { to: '/store/settings', label: 'Mağaza Ayarları', icon: <FaCog className={styles.navIcon} />, end: false },
  { to: '/store/billing', label: 'Fatura & Abonelik', icon: <FaFileInvoiceDollar className={styles.navIcon} />, end: false },
];

export const StoreAdminLayout = () => {
  const { tenantName, tenantSlug, logout } = useStoreAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/store-login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandRow}>
            <div className={styles.brandIcon}>
              <FaStore />
            </div>
            <div>
              <p className={styles.brandName}>{tenantName ?? 'Mağazam'}</p>
              <p className={styles.brandSub}>{tenantSlug ?? ''}</p>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>Yönetim</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink}${isActive ? ` ${styles.active}` : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTenantName}>{tenantName ?? 'Mağaza Paneli'}</h1>
            <p className={styles.headerSubtitle}>Mağaza Yönetim Paneli</p>
          </div>

          <button className={styles.logoutButton} onClick={handleLogout}>
            <FaSignOutAlt />
            Çıkış Yap
          </button>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
