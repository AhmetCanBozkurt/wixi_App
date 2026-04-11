import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaMoon, FaSun, FaBell, FaGlobe, FaChevronRight } from 'react-icons/fa';
import { useAuthStore } from '../../entities/User/model/store';
import { useTheme } from '../../app/providers/ThemeProvider';
import { apiClient } from '../../shared/api/axiosConfig';
import styles from './Header.module.css';

interface Language {
  id: string;
  code: string;
  name: string;
  iconBase64?: string;
}

export const Header = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Breadcrumb mapping
  const pathMap: Record<string, string> = {
    'admin': 'Yönetim',
    'logs': 'Uygulama Logları',
    'languages': 'Dil Yönetimi',
    'menus': 'Menü Yönetimi',
    'users': 'Kullanıcı Yönetimi',
    'audit': 'Audit Logları',
    'ui-showcase': 'Bileşen Kütüphanesi',
    'dashboard': 'Dashboard'
  };

  const getBreadcrumbs = () => {
    // 'admin' gibi ara yolları filtrele, sadece Dashboard ve son sayfa kalsın isteniyor
    const paths = location.pathname.split('/').filter(p => p && p !== 'admin');
    if (paths.length === 0) return [];
    
    return paths.map((p, index) => {
      // Gerçek URL'i oluştururken 'admin'i silmiyoruz ki linkler bozulmasın
      const originalPaths = location.pathname.split('/').filter(p => p);
      const url = `/${originalPaths.slice(0, originalPaths.indexOf(p) + 1).join('/')}`;
      
      return {
        path: url,
        label: pathMap[p] || p.charAt(0).toUpperCase() + p.slice(1)
      };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  
  const [languages, setLanguages] = useState<Language[]>([]);
  // ... rest of state stays same ...
  const [showLangs, setShowLangs] = useState(false);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lng') || 'tr-TR');
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await apiClient.get<Language[]>('language');
        setLanguages(res.data);
      } catch (err) {
        console.error("Diller yüklenemedi", err);
      }
    };

    fetchLanguages();

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (code: string) => {
    localStorage.setItem('lng', code);
    setCurrentLang(code);
    setShowLangs(false);
    window.location.reload();
  };

  const getInitials = () => {
    if (user?.email) {
      const parts = user.email.split('@')[0].split(/[._-]/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'WX';
  };

  const displayName = user?.email?.split('@')[0] || 'Kullanıcı';

  const activeLang = languages.find(l => l.code === currentLang);

  return (
    <header className={styles.headerContainer}>
      <div className={styles.leftSection}>
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbItem}>Dashboard</Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.path}>
              <span className={styles.breadcrumbSep}>
                <FaChevronRight size={10} />
              </span>
              {idx === breadcrumbs.length - 1 ? (
                <span className={styles.breadcrumbCurrent}>{bc.label}</span>
              ) : (
                <Link to={bc.path} className={styles.breadcrumbItem}>{bc.label}</Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.langWrapper} ref={langMenuRef}>
          <button 
            className={`${styles.langBtn} ${showLangs ? styles.active : ''}`} 
            onClick={() => setShowLangs(!showLangs)}
            title="Dil Değiştir"
          >
            {activeLang?.iconBase64 ? (
              <img 
                src={activeLang.iconBase64} 
                alt="Flag" 
                className={styles.activeFlagImg} 
              />
            ) : (
              <FaGlobe />
            )}
            <span className={styles.activeLangCode}>
              {currentLang.split('-')[1] || currentLang.substring(0, 2).toUpperCase()}
            </span>
          </button>
          
          {showLangs && (
            <div className={styles.langDropdown}>
              {languages.length === 0 && <div className={styles.langItem}>Yükleniyor...</div>}
              {languages.map(lang => (
                <button 
                  key={lang.id} 
                  className={`${styles.langItem} ${currentLang === lang.code ? styles.langItemActive : ''}`}
                  onClick={() => handleLangChange(lang.code)}
                >
                  <div className={styles.flagIconWrapper}>
                    {lang.iconBase64 ? (
                      <img 
                        src={lang.iconBase64} 
                        alt={lang.name} 
                        className={styles.itemFlagImg} 
                      />
                    ) : (
                      <span className={styles.flagTextPlaceholder}>{lang.code.split('-')[1] || lang.code.substring(0, 2)}</span>
                    )}
                  </div>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          title={theme === 'dark' ? "Light Moda Geç" : "Dark Moda Geç"}
        >
          {theme === 'dark' ? <><FaSun /> Light</> : <><FaMoon /> Dark</>}
        </button>

        <button className={styles.iconBtn} title="Bildirimler">
          <FaBell />
        </button>

        <div className={styles.divider} />

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userRole}>{user?.roles?.[0] || 'Admin'}</span>
          </div>
          <div className={styles.avatar}>
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};
