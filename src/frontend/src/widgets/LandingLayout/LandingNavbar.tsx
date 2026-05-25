import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import s from './LandingNavbar.module.css';

interface Props {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { href: '/ozellikler', label: 'Özellikler' },
  { href: '/moduller', label: 'Modüller' },
  { href: '/studyo', label: 'Stüdyo' },
  { href: '/fiyatlandirma', label: 'Fiyatlandırma' },
  { href: '/nasil-calisir', label: 'Nasıl Çalışır?' },
  { href: '/sss', label: 'SSS' },
];

export function LandingNavbar({ theme, onToggleTheme }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
        <div className={`lp-container ${s.row}`}>
          <Link to="/" className={s.brand}>
            <span className={s.brandMark}>W</span>
            <span className={s.brandName}>WIXI<span className={s.dim}>APP</span></span>
          </Link>

          <nav className={s.links}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={location.pathname === link.href ? `${s.link} ${s.active}` : s.link}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={s.cta}>
            <Link to="/login" className={`lp-btn lp-btn--ghost lp-btn--sm ${s.loginBtn}`}>
              Giriş Yap
            </Link>
            <Link to="/register" className="lp-btn lp-btn--primary lp-btn--sm">
              Hemen Başla
            </Link>
            <button
              className={s.themeToggle}
              aria-label="Tema değiştir"
              onClick={onToggleTheme}
            >
              {/* Moon icon */}
              <svg className={`${s.themeIcon} ${theme === 'dark' ? s.iconVisible : s.iconHidden}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              {/* Sun icon */}
              <svg className={`${s.themeIcon} ${theme === 'light' ? s.iconVisible : s.iconHidden}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            </button>
            <button
              ref={burgerRef}
              className={`${s.burger} ${drawerOpen ? s.open : ''}`}
              aria-label="Menü"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(v => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`${s.drawer} ${drawerOpen ? s.drawerOpen : ''}`}>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            to={link.href}
            className={s.drawerLink}
            onClick={() => setDrawerOpen(false)}
          >
            {link.label} <span>→</span>
          </Link>
        ))}
        <div className={s.drawerRow}>
          <Link to="/login" className="lp-btn lp-btn--ghost" onClick={() => setDrawerOpen(false)}>
            Giriş Yap
          </Link>
          <Link to="/register" className="lp-btn lp-btn--primary" onClick={() => setDrawerOpen(false)}>
            Hemen Başla
          </Link>
        </div>
      </div>
    </>
  );
}
