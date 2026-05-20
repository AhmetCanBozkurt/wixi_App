import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  let globalComponents: GlobalComponentsConfig | null = null;
  if (settings?.globalComponentsConfigJson) {
    try {
      globalComponents = JSON.parse(settings.globalComponentsConfigJson) as GlobalComponentsConfig;
    } catch {
      // ignore
    }
  }
  const isSticky = globalComponents?.navbar?.isSticky ?? true;
  const showLanguagePicker = globalComponents?.navbar?.showLanguagePicker ?? true;
  const navbarCustomCss = globalComponents?.navbar?.customCss ?? '';
  const navbarCustomJs = globalComponents?.navbar?.customJs ?? '';

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { customer, isAuthenticated, logout } = useCustomerStore();
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const navPages = pages.filter(
    (p) => p.isPublished && p.pageType !== 'Home' && p.pageType !== 'ProductDetail'
  );

  const supportedLangs = settings?.supportedLanguages
    ? (() => { try { return JSON.parse(settings.supportedLanguages) as string[]; } catch { return ['tr']; } })()
    : ['tr'];

  const currentLang = localStorage.getItem('lng')?.split('-')[0] || settings?.defaultLanguage || 'tr';

  const handleLogout = () => {
    logout(tenantSlug);
    setDropdownOpen(false);
    navigate(`/store/${tenantSlug}/login`);
  };

  return (
    <>
      {navbarCustomCss && (
        <style dangerouslySetInnerHTML={{ __html: navbarCustomCss }} />
      )}
    <header className={`${styles.navbar} ${isSticky ? '' : styles.stickyOff}`} ref={navRef}>
      <div className={styles.inner}>
        <Link to={`/store/${tenantSlug}`} className={styles.logo}>
          {settings?.logoUrl
            ? <img src={settings.logoUrl} alt={settings.storeName} className={styles.logoImg} />
            : <span className={styles.logoText}>{settings?.storeName || 'Mağaza'}</span>
          }
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link to={`/store/${tenantSlug}`} className={styles.navLink} onClick={() => setMenuOpen(false)}>
            Ana Sayfa
          </Link>
          {navPages.map((p) => (
            <Link
              key={p.id}
              to={p.slug === 'home' ? `/store/${tenantSlug}` : `/store/${tenantSlug}/${p.slug}`}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {p.title}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Tema değiştir"
            title={theme === 'light' ? 'Karanlık mod' : 'Aydınlık mod'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {showLanguagePicker && supportedLangs.length > 1 && (
            <LanguageSwitcher
              supported={supportedLangs}
              current={currentLang}
              onChange={(lang) => {
                localStorage.setItem('lng', lang);
                window.location.reload();
              }}
            />
          )}

          <CartBadge tenantSlug={tenantSlug} />

          {isAuthenticated && customer ? (
            <div className={styles.customerMenu}>
              <button
                className={styles.customerBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {customer.firstName}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to={`/store/${tenantSlug}/account`}
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Hesabım
                  </Link>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to={`/store/${tenantSlug}/login`} className={styles.loginBtn}>
              Giriş Yap
            </Link>
          )}

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
      {navbarCustomJs && (
        <script dangerouslySetInnerHTML={{ __html: navbarCustomJs }} />
      )}
    </>
  );
};
