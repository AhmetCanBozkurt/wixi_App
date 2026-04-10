import { FaMoon, FaSun, FaBell, FaGlobe } from 'react-icons/fa';
import { useAuthStore } from '../../entities/User/model/store';
import { useTheme } from '../../app/providers/ThemeProvider';
import styles from './Header.module.css';

export const Header = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  // Extract initials for the avatar (e.g. from Ahmet Can Bozkurt -> AB, or from email admin@... -> AD)
  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.leftSection}>
        {/* Placeholder for Breadcrumbs if needed */}
        <h2 className={styles.title}>Dashboard</h2>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.iconGroup}>
          <button className={styles.iconBtn} title="Dili Değiştir">
            <FaGlobe />
          </button>

          <button 
            className={styles.iconBtn} 
            title={theme === 'dark' ? "Light Mod'a Geç" : "Dark Mod'a Geç"}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          <button className={styles.iconBtn} title="Bildirimler">
            <FaBell />
          </button>
        </div>

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.email?.split('@')[0] || 'Kullanıcı'}</span>
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
