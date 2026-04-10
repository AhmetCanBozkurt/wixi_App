import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt, FaChartBar, FaUser, FaCog, FaGlobe, FaTh,
  FaFolderOpen, FaAward, FaCommentAlt, FaHeadset, FaBars, FaTimes,
  FaChevronDown, FaChevronRight, FaStar, FaListAlt, FaSearch,
  FaAngleDoubleDown, FaAngleDoubleUp
} from 'react-icons/fa';
import styles from './Sidebar.module.css';

const ALL_WORKSPACES = [
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

const STORAGE_KEYS = {
  COLLAPSED: 'wixi-sidebar-collapsed',
  EXPANDED:  'wixi-sidebar-expanded',
  FAVORITES: 'wixi-sidebar-favorites',
} as const;

const DEFAULT_FAVORITES = ['/', '/admin/application-logs'];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    localStorage.getItem(STORAGE_KEYS.COLLAPSED) === 'true'
  );

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPANDED);
      return saved ? JSON.parse(saved) : { sistem: true };
    } catch { return { sistem: true }; }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    } catch { return DEFAULT_FAVORITES; }
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCollapseToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(STORAGE_KEYS.COLLAPSED, String(next));
    if (next) { setSearchOpen(false); setSearchQuery(''); }
  };

  const toggleCategory = (id: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem(STORAGE_KEYS.COLLAPSED, 'false');
    }
    setExpandedCategories(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEYS.EXPANDED, JSON.stringify(next));
      return next;
    });
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    ALL_WORKSPACES.forEach(ws => { all[ws.id] = true; });
    setExpandedCategories(all);
    localStorage.setItem(STORAGE_KEYS.EXPANDED, JSON.stringify(all));
  };

  const collapseAll = () => {
    setExpandedCategories({});
    localStorage.setItem(STORAGE_KEYS.EXPANDED, '{}');
  };

  const toggleFavorite = (path: string) => {
    setFavorites(prev => {
      const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  };

  const handleSearchToggle = () => {
    if (searchOpen) { setSearchQuery(''); }
    setSearchOpen(o => !o);
  };

  const filteredWorkspaces = ALL_WORKSPACES.map(ws => ({
    ...ws,
    items: ws.items.filter(item =>
      !searchQuery || item.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(ws => ws.items.length > 0);

  const favoriteItems = ALL_WORKSPACES.flatMap(ws => ws.items)
    .filter(item => favorites.includes(item.path));

  const renderMenuItem = (item: { path: string; icon: React.ReactNode; text: string }, indent = true) => (
    <li key={item.path} className={styles.menuItemRow}>
      <NavLink
        to={item.path}
        className={({ isActive }) => isActive ? styles.active : ''}
        title={isCollapsed ? item.text : undefined}
        style={!indent ? { paddingLeft: '14px' } : undefined}
      >
        <span className={styles.menuIcon}>{item.icon}</span>
        <span className={styles.menuText}>{item.text}</span>
      </NavLink>
      {!isCollapsed && (
        <button
          className={`${styles.favStarBtn} ${favorites.includes(item.path) ? styles.isFav : ''}`}
          onClick={() => toggleFavorite(item.path)}
          title={favorites.includes(item.path) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <FaStar />
        </button>
      )}
    </li>
  );

  return (
    <aside className={`${styles.sidebarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* ── Header ── */}
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
        <button className={styles.toggleBtn} onClick={handleCollapseToggle} title="Menüyü Daralt/Genişlet">
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav className={styles.navArea}>
        {/* ── FAVORİLER ── */}
        {favoriteItems.length > 0 && !searchQuery && (
          <div className={styles.favoritesSection}>
            <div className={styles.sectionLabel}>
              <FaStar className={styles.starIconGold} />
              {!isCollapsed && <span className={styles.sectionTitleText}>FAVORİLER</span>}
            </div>
            <ul className={styles.menuList}>
              {favoriteItems.map(item => renderMenuItem(item, false))}
            </ul>
          </div>
        )}

        {/* ── BÖLÜMLER header: arama ikon + tümünü aç/kapat ── */}
        {!isCollapsed && (
          <>
            <div className={styles.sectionControls}>
              <span className={styles.sectionControlsTitle}>BÖLÜMLER</span>
              <button className={styles.ctrlBtn} onClick={handleSearchToggle} title="Menüde Ara">
                <FaSearch />
              </button>
              <button className={styles.ctrlBtn} onClick={expandAll} title="Tümünü Aç">
                <FaAngleDoubleDown />
              </button>
              <button className={styles.ctrlBtn} onClick={collapseAll} title="Tümünü Kapat">
                <FaAngleDoubleUp />
              </button>
            </div>

            {/* Inline arama satırı — sadece ikon tıklanınca açılır */}
            {searchOpen && (
              <div className={styles.inlineSearch}>
                <FaSearch className={styles.inlineSearchIcon} />
                <input
                  autoFocus
                  type="text"
                  className={styles.inlineSearchInput}
                  placeholder="Menüde ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        {/* ── Accordion Sections ── */}
        {filteredWorkspaces.map(ws => {
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

              {(isExpanded || searchQuery) && !isCollapsed && (
                <ul className={styles.menuList}>
                  {ws.items.map(item => renderMenuItem(item))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
