import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt, FaCog, FaTh,
  FaBars, FaTimes, FaChevronDown, FaChevronRight,
  FaStar, FaListAlt, FaSearch, FaEllipsisH
} from 'react-icons/fa';
import styles from './Sidebar.module.css';
import logoImg from '../../assets/Logolar/logo.png';

// ─── Sayfası olan menüler ─────────────────────────────
const ALL_WORKSPACES = [
  {
    id: 'main',
    name: 'Ana Menü',
    icon: <FaTh />,
    items: [
      { path: '/', icon: <FaTachometerAlt />, text: 'Dashboard' },
    ]
  },
  {
    id: 'sistem',
    name: 'Sistem',
    icon: <FaCog />,
    items: [
      { path: '/admin/application-logs', icon: <FaListAlt />, text: 'Uygulama Logları' },
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

  // "..." dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Handlers ───────────────────────────────────────
  const handleCollapseToggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(STORAGE_KEYS.COLLAPSED, String(next));
    if (next) { setSearchOpen(false); setSearchQuery(''); setMenuOpen(false); }
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
    setMenuOpen(false);
  };

  const collapseAll = () => {
    setExpandedCategories({});
    localStorage.setItem(STORAGE_KEYS.EXPANDED, '{}');
    setMenuOpen(false);
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, '[]');
    setMenuOpen(false);
  };

  const toggleFavorite = (path: string) => {
    setFavorites(prev => {
      const next = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  };

  const handleSearchToggle = () => {
    if (searchOpen) setSearchQuery('');
    setSearchOpen(o => !o);
  };

  // Filtered workspaces by search
  const filteredWorkspaces = ALL_WORKSPACES.map(ws => ({
    ...ws,
    items: ws.items.filter(item =>
      !searchQuery || item.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(ws => ws.items.length > 0);

  const favoriteItems = ALL_WORKSPACES.flatMap(ws => ws.items)
    .filter(item => favorites.includes(item.path));

  // Are all expanded?
  const allExpanded = ALL_WORKSPACES.every(ws => expandedCategories[ws.id]);

  // ─── Render helpers ───────────────────────────────
  const renderMenuItem = (item: { path: string; icon: React.ReactNode; text: string }, isTopLevel = false) => (
    <li key={item.path} className={styles.menuItemRow}>
      <NavLink
        to={item.path}
        className={({ isActive }) => isActive ? styles.active : ''}
        title={isCollapsed ? item.text : undefined}
        style={isTopLevel ? { paddingLeft: '14px' } : undefined}
      >
        <span className={styles.menuIcon}>{item.icon}</span>
        <span className={styles.menuText}>{item.text}</span>
      </NavLink>
      {/* Star button — JSX controlled, never shows in collapsed */}
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
      {/* ── Logo / Header ── */}
      <div className={styles.header}>
        <div className={styles.logoArea}>
          <img src={logoImg} alt="Wixi Logo" className={styles.logoImage} />
          {!isCollapsed && (
            <div className={styles.titleBox}>
              <h1>Wixisoftware</h1>
              <p>Admin Panel</p>
            </div>
          )}
        </div>
        <button className={styles.toggleBtn} onClick={handleCollapseToggle} title="Menüyü Daralt/Genişlet">
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav className={styles.navArea}>
        {/* ── FAVORİLER — sadece genişletilmiş modda etiket göster ── */}
        {favoriteItems.length > 0 && !searchQuery && (
          <div className={styles.favoritesSection}>
            {/* Etiket sadece genişletilmiş modda görünür */}
            {!isCollapsed && (
              <div className={styles.sectionLabel}>
                <FaStar className={styles.starIconGold} />
                <span className={styles.sectionTitleText}>FAVORİLER</span>
              </div>
            )}
            <ul className={styles.menuList}>
              {favoriteItems.map(item => renderMenuItem(item, true))}
            </ul>
          </div>
        )}

        {/* ── BÖLÜMLER başlığı + 🔍 ve ... menüsü ── */}
        {!isCollapsed && (
          <>
            <div className={styles.sectionControls}>
              <span className={styles.sectionControlsTitle}>BÖLÜMLER</span>

              {/* Arama ikonu */}
              <button
                className={`${styles.ctrlBtn} ${searchOpen ? styles.ctrlBtnActive : ''}`}
                onClick={handleSearchToggle}
                title="Ara"
              >
                <FaSearch />
              </button>

              {/* "..." dropdown trigger */}
              <div className={styles.ctrlMenuWrapper} ref={menuRef}>
                <button
                  className={`${styles.ctrlBtn} ${menuOpen ? styles.ctrlBtnActive : ''}`}
                  onClick={() => setMenuOpen(o => !o)}
                  title="Seçenekler"
                >
                  <FaEllipsisH />
                </button>

                {menuOpen && (
                  <div className={styles.ctrlDropdown}>
                    <button className={styles.ctrlDropdownItem} onClick={allExpanded ? collapseAll : expandAll}>
                      <FaChevronDown
                        className={styles.ctrlDropdownIcon}
                        style={{ transform: allExpanded ? 'rotate(180deg)' : 'none' }}
                      />
                      {allExpanded ? 'Tümünü Kapat' : 'Tümünü Aç'}
                    </button>
                    <button className={styles.ctrlDropdownItem} onClick={clearFavorites}>
                      <FaStar className={`${styles.ctrlDropdownIcon} ${styles.starIconGold}`} />
                      Favorileri Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inline arama */}
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
