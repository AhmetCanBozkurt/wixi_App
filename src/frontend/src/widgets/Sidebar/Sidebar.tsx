import { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaBars, FaTimes, FaChevronDown, FaChevronRight,
  FaStar, FaSearch, FaEllipsisH, FaSignOutAlt
} from 'react-icons/fa';
import { apiClient } from '../../shared/api/axiosConfig';
import { DynamicIcon } from '../../shared/ui/DynamicIcon/DynamicIcon';
import { useAuthStore } from '../../entities/User/model/store';
import styles from './Sidebar.module.css';
import logoImg from '../../assets/Logolar/logo.png';

// ─── Types ───────────────────────────────────────────────
interface MenuItemDto {
  id: string;
  title: string;
  path: string;
  icon?: string;
  iconColor?: string;
  sortOrder: number;
  children: MenuItemDto[];
}

const STORAGE_KEYS = {
  COLLAPSED: 'wixi-sidebar-collapsed',
  EXPANDED:  'wixi-sidebar-expanded',
  FAVORITES: 'wixi-sidebar-favorites',
} as const;

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: (val: boolean) => void;
}

export const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const [menus, setMenus] = useState<MenuItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout: storeLogout } = useAuthStore();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPANDED);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : ['/', '/admin/logs'];
    } catch { return ['/', '/admin/logs']; }
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch menus from API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await apiClient.get<MenuItemDto[]>('menu/sidebar');
        setMenus(res.data);
      } catch (error) {
        console.error('Menu fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Recursive Helpers ───
  const filterMenuTree = (items: MenuItemDto[], query: string): MenuItemDto[] => {
    return items
      .map(item => {
        const children = item.children ? filterMenuTree(item.children, query) : [];
        const isMatch = item.title.toLowerCase().includes(query.toLowerCase());
        
        if (isMatch || children.length > 0) {
          return { ...item, children };
        }
        return null;
      })
      .filter((item): item is MenuItemDto => item !== null);
  };

  const getFlatItems = (items: MenuItemDto[]): MenuItemDto[] => {
    let result: MenuItemDto[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result = [...result, ...getFlatItems(item.children)];
      }
    });
    return result;
  };

  // ─── Handlers ───────────────────────────────────────
  const handleCollapseToggle = () => {
    const next = !isCollapsed;
    onToggleCollapse(next);
    localStorage.setItem(STORAGE_KEYS.COLLAPSED, String(next));
    if (next) { setSearchOpen(false); setSearchQuery(''); setMenuOpen(false); }
  };

  const toggleCategory = (id: string) => {
    if (isCollapsed) {
      onToggleCollapse(false);
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
    const flat = getFlatItems(menus);
    flat.forEach((m: MenuItemDto) => { if (m.children && m.children.length > 0) all[m.id] = true; });
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

  const handleLogout = async () => {
    try {
      await apiClient.post('auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      window.location.href = '/login';
    }
  };

  // ─── Derived Data ─────────────────────────────────
  const filteredMenus = useMemo(() => 
    filterMenuTree(menus, searchQuery), 
    [menus, searchQuery]
  );

  const flatItems = useMemo(() => getFlatItems(menus), [menus]);
  const favoriteItems = flatItems.filter((item: MenuItemDto) => favorites.includes(item.path));

  const allExpanded = menus.length > 0 && menus.every(m => (m.children && m.children.length === 0) || expandedCategories[m.id]);

  // ─── Recursive Component ──────────────────────────
  const renderMenuNode = (item: MenuItemDto, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedCategories[item.id] || !!searchQuery;
    const paddingLeft = isCollapsed ? undefined : (level * 15) + 14;

    if (!hasChildren) {
      return (
        <li key={item.id} className={styles.menuItemRow}>
          <NavLink
            to={item.path}
            className={({ isActive }) => isActive ? styles.active : ''}
            title={isCollapsed ? item.title : undefined}
            style={{ paddingLeft }}
          >
            <span className={styles.menuIcon}>
              <DynamicIcon name={item.icon || 'FaCircle'} color={item.iconColor} />
            </span>
            <span className={styles.menuText}>{item.title}</span>
          </NavLink>
          {!isCollapsed && item.path !== '#' && (
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
    }

    return (
      <div key={item.id} className={styles.section}>
        <button
          className={`${styles.accordionHeader} ${isExpanded ? styles.isExpanded : ''}`}
          onClick={() => toggleCategory(item.id)}
          title={isCollapsed ? item.title : undefined}
          style={{ paddingLeft }}
        >
          <div className={styles.accordionTitle}>
            <DynamicIcon name={item.icon || 'FaFolder'} color={item.iconColor} />
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            <span className={styles.accordionArrow}>
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </span>
          )}
        </button>
        {isExpanded && !isCollapsed && (
          <ul className={styles.menuList}>
            {item.children.map(child => renderMenuNode(child, level + 1))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <aside className={`${styles.sidebarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
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
        {loading && !isCollapsed && <div style={{ padding: '20px', color: '#fff', opacity: 0.5 }}>Yükleniyor...</div>}

        {favoriteItems.length > 0 && !searchQuery && (
          <div className={styles.favoritesSection}>
            {!isCollapsed && (
              <div className={styles.sectionLabel}>
                <FaStar className={styles.starIconGold} />
                <span className={styles.sectionTitleText}>FAVORİLER</span>
              </div>
            )}
            <ul className={styles.menuList}>
              {favoriteItems.map((item: MenuItemDto) => (
                <li key={item.id + '_fav'} className={styles.menuItemRow}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => isActive ? styles.active : ''}
                    title={isCollapsed ? item.title : undefined}
                    style={{ paddingLeft: '14px' }}
                  >
                    <span className={styles.menuIcon}>
                      <DynamicIcon name={item.icon || 'FaCircle'} color={item.iconColor} />
                    </span>
                    <span className={styles.menuText}>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isCollapsed && menus.length > 0 && (
          <>
            <div className={styles.sectionControls}>
              <span className={styles.sectionControlsTitle}>BÖLÜMLER</span>
              <button
                className={`${styles.ctrlBtn} ${searchOpen ? styles.ctrlBtnActive : ''}`}
                onClick={handleSearchToggle}
                title="Ara"
              >
                <FaSearch />
              </button>
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

        {filteredMenus.map((m: MenuItemDto) => renderMenuNode(m, 0))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt />
          {!isCollapsed && <span>Oturumu Kapat</span>}
        </button>
      </div>
    </aside>
  );
};
