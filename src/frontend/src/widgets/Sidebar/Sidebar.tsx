import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, FaChartBar, FaUser, FaCog, FaGlobe, FaTh, 
  FaFolderOpen, FaAward, FaCommentAlt, FaHeadset, FaBars, FaTimes,
  FaChevronDown, FaChevronRight, FaStar, FaListAlt
} from 'react-icons/fa';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  // Persist collapse state in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('wixi-sidebar-collapsed') === 'true';
  });
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('wixi-sidebar-expanded');
      return saved ? JSON.parse(saved) : { 'sistem': true };
    } catch {
      return { 'sistem': true };
    }
  });

  // Toggle categories (Accordion) + persist
  const toggleCategory = (id: string) => {
    if (isCollapsed) {
      const newCollapsed = false;
      setIsCollapsed(newCollapsed);
      localStorage.setItem('wixi-sidebar-collapsed', String(newCollapsed));
    }
    setExpandedCategories(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('wixi-sidebar-expanded', JSON.stringify(next));
      return next;
    });
  };

  const handleCollapseToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('wixi-sidebar-collapsed', String(next));
  };

  const favorites = [
    { path: '/', icon: <FaTachometerAlt />, text: 'Dashboard' },
    { path: '/admin/application-logs', icon: <FaListAlt />, text: 'Uygulama Logları' }
  ];

  const workspaces = [
    {
      id: 'main',
      name: 'Ana Menü',
      icon: <FaTh />,
      items: [
        { path: '/', icon: <FaTachometerAlt />, text: 'Dashboard' },
        { path: '/admin/reports', icon: <FaChartBar />, text: 'Raporlar' },
      ]
    },
    {
      id: 'sistem',
      name: 'Sistem',
      icon: <FaCog />,
      items: [
        { path: '/admin/roles', icon: <FaUser />, text: 'Kullanıcılar ve Roller' },
        { path: '/admin/application-logs', icon: <FaListAlt />, text: 'Uygulama Logları' },
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
              <h1>Wixisoftware</h1>
              <p>Admin Panel</p>
            </div>
          </div>
        )}
        <button 
          className={styles.toggleBtn} 
          onClick={handleCollapseToggle}
          title="Menüyü Daralt/Genişlet"
        >
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav className={styles.navArea}>
        {/* FAVORITES */}
        <div className={styles.favoritesSection}>
          <div className={styles.sectionHeader}>
            <FaStar className={styles.starIcon} />
            {!isCollapsed && <span className={styles.sectionTitleText}>FAVORİLER</span>}
          </div>
          <ul className={styles.menuList}>
             {favorites.map((fav, idx) => (
                <li key={`fav-${idx}`} className={styles.menuItem}>
                  <NavLink 
                    to={fav.path}
                    className={({ isActive }) => isActive ? styles.active : ''}
                    title={isCollapsed ? fav.text : undefined}
                  >
                    <span className={styles.menuIcon}>{fav.icon}</span>
                    <span className={styles.menuText}>{fav.text}</span>
                  </NavLink>
                </li>
             ))}
          </ul>
        </div>

        {/* WORKSPACES (ACCORDION) */}
        {!isCollapsed && <div className={styles.sectionHeaderSpacer}>BÖLÜMLER</div>}
        {workspaces.map((ws) => {
          const isExpanded = expandedCategories[ws.id];
          return (
            <div key={ws.id} className={styles.section}>
              <button 
                className={styles.accordionHeader} 
                onClick={() => toggleCategory(ws.id)}
                title={isCollapsed ? ws.name : undefined}
              >
                <div className={styles.accordionTitle}>
                  {ws.icon}
                  {!isCollapsed && <span>{ws.name}</span>}
                </div>
                {!isCollapsed && (
                  <span className={styles.accordionArrow}>
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </button>
              
              {(!isCollapsed && isExpanded) && (
                <ul className={styles.menuList}>
                  {ws.items.map((item, idx) => (
                    <li key={idx} className={styles.menuItem}>
                      <NavLink 
                        to={item.path}
                        className={({ isActive }) => isActive ? styles.active : ''}
                        title={isCollapsed ? item.text : undefined}
                      >
                        <span className={styles.menuIcon}>{item.icon}</span>
                        <span className={styles.menuText}>{item.text}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
