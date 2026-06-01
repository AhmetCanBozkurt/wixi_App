import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import type { StorePageSummary, StoreSettings, GlobalComponentsConfig } from '../../entities/StorePage/model/types';
import { useCustomerStore } from '../../entities/Customer/model/store';
import { useTheme } from '../../app/providers/ThemeProvider';
import { CartBadge } from '../CartBadge/CartBadge';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import styles from './StorefrontNavbar.module.css';

interface StorefrontNavbarProps {
  settings: StoreSettings | null;
  pages: StorePageSummary[];
  tenantSlug: string;
}

export const StorefrontNavbar = ({ settings, pages, tenantSlug }: StorefrontNavbarProps) => {
  // ── Parse global config ──────────────────────────────────────────────────────
  let globalComponents: GlobalComponentsConfig | null = null;
  if (settings?.globalComponentsConfigJson) {
    try {
      globalComponents = JSON.parse(settings.globalComponentsConfigJson) as GlobalComponentsConfig;
    } catch { /* ignore */ }
  }

  const navLayout     = globalComponents?.navbar?.layout ?? 'classic';
  const logoPosition  = globalComponents?.navbar?.logoPosition ?? 'left';
  const isSticky      = globalComponents?.navbar?.isSticky ?? true;
  const showSearch    = globalComponents?.navbar?.showSearch ?? true;
  const showLangPicker = globalComponents?.navbar?.showLanguagePicker ?? true;
  const navbarCustomCss = globalComponents?.navbar?.customCss ?? '';
  const navbarCustomJs  = globalComponents?.navbar?.customJs ?? '';

  // ── Local state ──────────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { customer, isAuthenticated, logout } = useCustomerStore();
  const { theme, toggleTheme } = useTheme();
  const navRef   = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const navPages = pages.filter(
    p => p.isPublished && p.pageType !== 'Home' && p.pageType !== 'ProductDetail',
  );

  const supportedLangs = settings?.supportedLanguages
    ? (() => { try { return JSON.parse(settings.supportedLanguages) as string[]; } catch { return ['tr']; } })()
    : ['tr'];

  const currentLang = localStorage.getItem('lng')?.split('-')[0] || settings?.defaultLanguage || 'tr';

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout(tenantSlug);
    setDropdownOpen(false);
    navigate(`/store/${tenantSlug}/login`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/store/${tenantSlug}/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  // ── Shared JSX pieces ────────────────────────────────────────────────────────
  const logoEl = (
    <Link to={`/store/${tenantSlug}`} className={styles.logo}>
      {settings?.logoUrl
        ? <img src={settings.logoUrl} alt={settings.storeName} className={styles.logoImg} />
        : <span className={styles.logoText}>{settings?.storeName || 'Mağaza'}</span>}
    </Link>
  );

  const navLinksEl = (
    <>
      <Link to={`/store/${tenantSlug}`} className={styles.navLink} onClick={() => setMenuOpen(false)}>
        Ana Sayfa
      </Link>
      {navPages.map(p => (
        <Link
          key={p.id}
          to={p.slug === 'home' ? `/store/${tenantSlug}` : `/store/${tenantSlug}/${p.slug}`}
          className={styles.navLink}
          onClick={() => setMenuOpen(false)}
        >
          {p.title}
        </Link>
      ))}
    </>
  );

  const actionsEl = (
    <div className={styles.actions}>
      {/* Search */}
      {showSearch && (
        <div className={styles.searchWrap}>
          {searchOpen ? (
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                ref={searchRef}
                className={styles.searchInput}
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="button" className={styles.searchCloseBtn} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                <FaTimes />
              </button>
            </form>
          ) : (
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Ara" title="Ara">
              <FaSearch />
            </button>
          )}
        </div>
      )}

      {/* Theme toggle */}
      <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Tema değiştir" title={theme === 'light' ? 'Karanlık mod' : 'Aydınlık mod'}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Language picker */}
      {showLangPicker && supportedLangs.length > 1 && (
        <LanguageSwitcher
          supported={supportedLangs}
          current={currentLang}
          onChange={lang => { localStorage.setItem('lng', lang); window.location.reload(); }}
        />
      )}

      {/* Cart */}
      <CartBadge tenantSlug={tenantSlug} />

      {/* Customer menu */}
      {isAuthenticated && customer ? (
        <div className={styles.customerMenu}>
          <button className={styles.customerBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
            {customer.firstName}
          </button>
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <Link to={`/store/${tenantSlug}/account`} className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                Hesabım
              </Link>
              <button className={styles.dropdownItem} onClick={handleLogout}>Çıkış Yap</button>
            </div>
          )}
        </div>
      ) : (
        <Link to={`/store/${tenantSlug}/login`} className={styles.loginBtn}>Giriş Yap</Link>
      )}

      {/* Hamburger */}
      <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü">
        <span /><span /><span />
      </button>
    </div>
  );

  // ── Layout variants ──────────────────────────────────────────────────────────
  const renderInner = () => {
    if (navLayout === 'centered') {
      return (
        <div className={`${styles.inner} ${styles.innerCentered}`}>
          {/* Row 1: logo center + actions right */}
          <div className={styles.centeredRow1}>
            <div className={styles.centeredSpacer} />
            {logoEl}
            {actionsEl}
          </div>
          {/* Row 2: nav links centered */}
          <nav className={`${styles.nav} ${styles.navCentered} ${menuOpen ? styles.navOpen : ''}`}>
            {navLinksEl}
          </nav>
        </div>
      );
    }

    // classic + mega (mega = classic now, full mega-menu is P2)
    const logoCenter = logoPosition === 'center';
    return (
      <div className={`${styles.inner} ${logoCenter ? styles.innerLogoCenter : ''}`}>
        {logoEl}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinksEl}
        </nav>
        {actionsEl}
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {navbarCustomCss && <style dangerouslySetInnerHTML={{ __html: navbarCustomCss }} />}
      <header
        className={`${styles.navbar} ${isSticky ? '' : styles.stickyOff} ${navLayout === 'mega' ? styles.mega : ''}`}
        ref={navRef}
      >
        {renderInner()}
      </header>
      {navbarCustomJs && <script dangerouslySetInnerHTML={{ __html: navbarCustomJs }} />}
    </>
  );
};
