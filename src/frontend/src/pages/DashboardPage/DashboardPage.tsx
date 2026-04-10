import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import { Header } from '../../widgets/Header/Header';
import { Outlet } from 'react-router-dom';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
