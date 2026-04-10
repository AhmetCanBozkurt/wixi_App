import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, FaChartBar, FaUser, FaCog, FaGlobe, FaTh, 
  FaFolderOpen, FaAward, FaCommentAlt, FaHeadset, FaBars, FaTimes
} from 'react-icons/fa';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // FSD standartlarında statik menü objesi - İleride API'den ('/api/v1/menus') gelecek
  const workspaces = [
    {
      id: 'main',
      name: 'Ana Menü',
      icon: <FaTachometerAlt />,
      items: [
        { path: '/', icon: <FaTachometerAlt />, text: 'Dashboard' },
        { path: '/admin/reports', icon: <FaChartBar />, text: 'Raporlar' },
        { path: '/admin/roles', icon: <FaUser />, text: 'Kullanıcılar ve Roller' },
        { path: '/admin/settings', icon: <FaCog />, text: 'Ayarlar' },
      ]
    },
    {
      id: 'tekstil',
      name: 'Tekstil Yönetimi',
      icon: <FaGlobe />,
      items: [
        { path: '/admin/tekstil/stats', icon: <FaChartBar />, text: 'İstatistikler' },
        { path: '/admin/tekstil/product-categories', icon: <FaFolderOpen />, text: 'Kategoriler' },
        { path: '/admin/tekstil/products', icon: <FaTh />, text: 'Ürünler' },
        { path: '/admin/tekstil/projects', icon: <FaAward />, text: 'Projeler' },
        { path: '/admin/tekstil/contact-submissions', icon: <FaCommentAlt />, text: 'İletişim Formları' },
        { path: '/admin/tekstil/contact-info', icon: <FaHeadset />, text: 'İletişim Bilgileri' },
      ]
    }
  ];

  return (
    <aside className={`${styles.sidebarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        {!isCollapsed && (
          <div className={styles.logoArea}>
            <div className={styles.logoIcon}>W</div>
            <div className={styles.titleBox}>
              <h1>Worklines</h1>
              <p>Admin Panel</p>
            </div>
          </div>
        )}
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Menüyü Daralt/Genişlet"
        >
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav className={styles.navArea}>
        {workspaces.map((ws) => (
          <div key={ws.id} className={styles.section}>
            <div className={styles.sectionTitle}>
              {ws.icon}
              <span>{ws.name}</span>
            </div>
            <ul className={styles.menuList}>
              {ws.items.map((item, idx) => (
                <li key={idx} className={styles.menuItem}>
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => isActive ? styles.active : undefined}
                    title={isCollapsed ? item.text : undefined}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuText}>{item.text}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
