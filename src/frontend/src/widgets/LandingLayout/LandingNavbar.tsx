import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import s from './LandingNavbar.module.css';
import { LanguageSwitcher } from './LanguageSwitcher';

interface Props {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { href: '/ozellikler', label: 'Özellikler', i18nKey: 'LANDING_NAV_FEATURES' },
  { href: '/moduller', label: 'Modüller', i18nKey: '' },
  { href: '/studyo', label: 'Stüdyo', i18nKey: '' },
  { href: '/fiyatlandirma', label: 'Fiyatlandırma', i18nKey: 'LANDING_NAV_PRICING' },
  { href: '/nasil-calisir', label: 'Nasıl Çalışır?', i18nKey: 'LANDING_NAV_HOW_IT_WORKS' },
  { href: '/sss', label: 'SSS', i18nKey: 'LANDING_NAV_FAQ' },
];

interface Lang { code: string; label: string; flag: string; dir: 'ltr' | 'rtl' }
const LANGUAGES: Lang[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
];

export function LandingNavbar({ theme, onToggleTheme }: Props) {
  const { i18n, t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('wixi-lang') ?? 'tr';
    return LANGUAGES.find((l) => l.code === stored) ?? LANGUAGES[0];
  });
  const location = useLocation();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  const selectLang = (lang: Lang) => {
    setActiveLang(lang);
    setLangOpen(false);
    localStorage.setItem('wixi-lang', lang.code);
    localStorage.setItem('landing-lng', lang.code);
    i18n.changeLanguage(lang.code);
  };

  // Sync dir/lang attributes to <html> whenever activeLang changes
  useEffect(() => {
    document.documentElement.dir = activeLang.dir;
    document.documentElement.lang = activeLang.code;
  }, [activeLang]);

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
                {link.i18nKey ? t(link.i18nKey) : link.label}
              </Link>
            ))}
          </nav>

          <div className={s.cta}>
            {/* Language switcher */}
            <div className={s.langSwitch} ref={langRef}>
              <button
                className={s.langBtn}
                onClick={() => setLangOpen((v) => !v)}
                aria-label="Dil seçin"
                aria-expanded={langOpen}
              >
                <span className={s.langFlag}>{activeLang.flag}</span>
                <span className={s.langCode}>{activeLang.code.toUpperCase()}</span>
                <svg
                  className={`${s.langChevron} ${langOpen ? s.langChevronOpen : ''}`}
                  width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {langOpen && (
                <div className={s.langMenu}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      className={`${s.langOption} ${activeLang.code === lang.code ? s.langOptionActive : ''}`}
                      onClick={() => selectLang(lang)}
                    >
                      <span className={s.langFlag}>{lang.flag}</span>
                      <span className={s.langLabel}>{lang.label}</span>
                      {activeLang.code === lang.code && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: '#a5b4fc' }}>
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/login" className={`lp-btn lp-btn--ghost lp-btn--sm ${s.loginBtn}`}>
              {t('LANDING_NAV_LOGIN')}
            </Link>
            <Link to="/register" className="lp-btn lp-btn--primary lp-btn--sm">
              {t('LANDING_NAV_START')}
            </Link>
            <LanguageSwitcher />
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
            {link.i18nKey ? t(link.i18nKey) : link.label} <span>→</span>
          </Link>
        ))}
        {/* Mobile lang switcher */}
        <div className={s.drawerLangs}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${s.drawerLangBtn} ${activeLang.code === lang.code ? s.drawerLangActive : ''}`}
              onClick={() => { selectLang(lang); setDrawerOpen(false); }}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
        <div className={s.drawerRow}>
          <Link to="/login" className="lp-btn lp-btn--ghost" onClick={() => setDrawerOpen(false)}>
            {t('LANDING_NAV_LOGIN')}
          </Link>
          <Link to="/register" className="lp-btn lp-btn--primary" onClick={() => setDrawerOpen(false)}>
            {t('LANDING_NAV_START')}
          </Link>
        </div>
      </div>
    </>
  );
}
