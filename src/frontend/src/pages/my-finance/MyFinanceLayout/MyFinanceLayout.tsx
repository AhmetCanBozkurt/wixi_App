import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  FaChartPie,
  FaExchangeAlt,
  FaWallet,
  FaTags,
  FaChevronLeft,
  FaChevronRight,
  FaChartLine,
  FaArrowLeft,
} from 'react-icons/fa';
import { useAuthStore } from '../../../entities/User/model/store';
import styles from './MyFinanceLayout.module.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/my-finance', label: 'Dashboard', icon: <FaChartPie /> },
  { path: '/my-finance/transactions', label: 'İşlemler', icon: <FaExchangeAlt /> },
  { path: '/my-finance/budgets', label: 'Bütçeler', icon: <FaWallet /> },
  { path: '/my-finance/categories', label: 'Kategoriler', icon: <FaTags /> },
];

export const MyFinanceLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('wixi-finance-sidebar-collapsed') === 'true'
  );
  const { user } = useAuthStore();

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('wixi-finance-sidebar-collapsed', String(next));
  };

  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
    : 'U';

  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : '';

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <FaChartLine />
          </div>
          {!isCollapsed && (
            <div>
              <div className={styles.logoTitle}>Finans</div>
              <div className={styles.logoSub}>Kişisel Takip</div>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/my-finance'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>{userInitials}</div>
            {!isCollapsed && (
              <span className={styles.userName}>{userName}</span>
            )}
          </div>
          <Link to="/admin" className={styles.adminLink}>
            <FaArrowLeft />
            {!isCollapsed && <span>Admin Panel</span>}
          </Link>
        </div>

        <button
          className={styles.collapseBtn}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Genişlet' : 'Daralt'}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </aside>

      <div className={`${styles.content} ${isCollapsed ? styles.contentExpanded : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};
