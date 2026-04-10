import { useAuthStore } from '../../entities/User/model/store';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <h1 className="textGradient">Wixi Platform</h1>
          <button onClick={logout} className={styles.logoutBtn}>Sistemden Çık</button>
        </header>
        <main className={styles.main}>
          <div className={styles.welcomeCard}>
            <h2>Sisteme Hoş Geldiniz, {user?.email}</h2>
            <p>Yekileriniz: <strong>{user?.roles?.join(', ')}</strong></p>
            <div className={styles.badge}>SİSTEM ÇEVRİMİÇİ</div>
          </div>
        </main>
      </div>
    </div>
  );
};
