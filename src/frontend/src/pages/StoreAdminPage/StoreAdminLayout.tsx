import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../widgets/Sidebar/Sidebar';
import { Header } from '../../widgets/Header/Header';
import styles from './StoreAdminLayout.module.css';

export const StoreAdminLayout = () => {
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
