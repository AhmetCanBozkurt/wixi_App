import { FaMoon, FaSun, FaBell, FaGlobe } from 'react-icons/fa';
import { useAuthStore } from '../../entities/User/model/store';
import { useTheme } from '../../app/providers/ThemeProvider';
import styles from './Header.module.css';

export const Header = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const getInitials = () => {
    if (user?.email) {
      const parts = user.email.split('@')[0].split(/[._-]/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'WX';
  };

  const displayName = user?.email?.split('@')[0] || 'Kullanıcı';

  return (
    <header className={styles.headerContainer}>
      {/* Left: Breadcrumb */}
      <div className={styles.leftSection}>
        <nav className={styles.breadcrumb}>
          <span className={styles.breadcrumbItem}>Dashboard</span>
          <span className={styles.breadcrumbSep}>›</span>
          <span className={styles.breadcrumbCurrent}>Admin Panel</span>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className={styles.rightSection}>
        {/* Language */}
        <button className={styles.iconBtn} title="Dil">
          <FaGlobe />
        </button>

        {/* Theme toggle - badge style like reference */}
        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          title={theme === 'dark' ? "Light Moda Geç" : "Dark Moda Geç"}
        >
          {theme === 'dark' ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn} title="Bildirimler">
          <FaBell />
        </button>

        <div className={styles.divider} />

        {/* User Profile - square avatar */}
        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{user?.roles?.[0] || 'Admin'}</span>
          </div>
          <div className={styles.avatar}>
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};
