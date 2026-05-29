import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import type { NavbarConfig } from '../../entities/StorePage/model/types';
import styles from './CorpNavbar.module.css';

interface CorpNavbarProps {
  config: NavbarConfig;
  tenantSlug: string;
  theme: { colors: { primary: string; background: string; text: string } };
}

export const CorpNavbar = ({ config, tenantSlug, theme }: CorpNavbarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const links = config.links && config.links.length > 0 ? config.links : [];
  const bg = theme.colors.background || '#ffffff';
  const textColor = theme.colors.text || '#111827';
  const primaryColor = theme.colors.primary || '#6366f1';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <>
      {config.customCss && <style dangerouslySetInnerHTML={{ __html: config.customCss }} />}
      <nav
        ref={navRef}
        className={`${styles.nav} ${config.isSticky ? styles.sticky : ''}`}
        style={{ backgroundColor: bg, color: textColor, borderBottom: `1px solid ${primaryColor}22` }}
      >
        <div className={styles.inner}>
          {/* Logo */}
          <Link to={`/corp/${tenantSlug}`} className={styles.logo} style={{ color: primaryColor }}>
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className={styles.logoImg} />
            ) : (
              <span>{config.logoText || tenantSlug}</span>
            )}
          </Link>

          {/* Desktop links */}
          <div className={`${styles.links} ${config.logoPosition === 'center' ? styles.linksCentered : ''}`}>
            {links.map((link, i) => (
              <a key={i} href={link.href} className={styles.link} style={{ color: textColor }}>
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className={styles.toggle}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menü"
            type="button"
            style={{ color: textColor }}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={styles.mobileMenu} style={{ backgroundColor: bg }}>
            {links.map((link, i) => (
              <a key={i} href={link.href} className={styles.mobileLink} style={{ color: textColor }} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>
      {/* Sticky spacer */}
      {config.isSticky && <div className={styles.spacer} />}
    </>
  );
};
