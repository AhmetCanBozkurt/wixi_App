import { useState } from 'react';
import { Sidebar } from '../../../widgets/Sidebar/Sidebar';
import { Header } from '../../../widgets/Header/Header';
import { Outlet } from 'react-router-dom';
import styles from './DashboardPage.module.css';

export const DashboardPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => 
    localStorage.getItem('wixi-sidebar-collapsed') === 'true'
  );

  return (
    <div className={styles.container}>
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={setIsCollapsed} />
      <div className={`${styles.contentWrapper} ${isCollapsed ? styles.collapsed : ''}`}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
