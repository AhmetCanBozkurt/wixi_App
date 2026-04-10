import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/language-context';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  submenu?: { name: string; href: string }[];
}

const CorporateHeader = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Dark mode initialization
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Dark mode toggle
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const root = document.documentElement;
    if (newIsDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigation: NavigationItem[] = [
    { name: t('nav.home') || 'Ana Sayfa', href: '/' },
    { name: t('nav.about') || 'Hakkımızda', href: '/about' },
    { name: t('nav.services') || 'Hizmetlerimiz', href: '/services' },
    { name: t('nav.solutions') || 'Çözümlerimiz', href: '/solutions' },
    { name: t('nav.references') || 'Referanslar', href: '/references' },
    {
      name: t('nav.blog') || 'Blog',
      href: '/blog',
      submenu: [
        { name: t('nav.blog.list') || 'Blog Listesi', href: '/blog' },
      ],
    },
    { name: t('nav.contact') || 'İletişim', href: '/contact' },
  ];

  const isHomePage = location.pathname === '/';
  const pathUrl = location.pathname;

  return (
    <header
      className={cn(
        'fixed h-24 top-0 py-1 z-50 w-full transition-all',
        !isScrolled && isHomePage
          ? 'bg-transparent shadow-none'
          : isScrolled && isHomePage
          ? 'bg-white dark:bg-darklight shadow-lg dark:shadow-dark-md'
          : 'bg-white dark:bg-darklight shadow-lg dark:shadow-dark-md'
      )}
    >
      <div className="container mx-auto max-w-6xl flex items-center justify-between p-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div
            className={cn(
              'text-2xl font-bold',
              !isScrolled && isHomePage
                ? 'text-white'
                : 'text-midnight_text dark:text-white'
            )}
          >
            Wixi Software
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex grow items-center justify-center gap-6">
          {navigation.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.submenu && setSubmenuOpen(item.href)}
              onMouseLeave={() => setSubmenuOpen(null)}
            >
              <Link
                to={item.href}
                className={cn(
                  'text-base flex py-2 font-normal hover:text-primary dark:hover:text-primary',
                  !isScrolled && isHomePage
                    ? 'text-white'
                    : 'text-midnight_text dark:text-white',
                  (isActive(item.href) ||
                    (item.href === '/blog' && pathUrl.startsWith('/blog')) ||
                    (item.href === '/references' && pathUrl.startsWith('/references'))) &&
                    'text-primary dark:text-primary'
                )}
              >
                {item.name}
                {item.submenu && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.5em"
                    height="1.5em"
                    viewBox="0 0 24 24"
                    className="ml-1"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="m7 10l5 5l5-5"
                    />
                  </svg>
                )}
              </Link>
              {submenuOpen === item.href && item.submenu && (
                <div
                  className="absolute py-2 left-0 mt-0.5 top-8 w-60 bg-white dark:bg-darklight shadow-lg dark:shadow-dark-md rounded-lg z-50 border border-gray-200 dark:border-dark_border"
                  data-aos="fade-up"
                  data-aos-duration="400"
                >
                  {item.submenu.map((subItem, index) => (
                    <Link
                      key={index}
                      to={subItem.href}
                      className={cn(
                        'block px-4 py-2 text-[15px] transition-colors',
                        isActive(subItem.href)
                          ? 'bg-primary text-white'
                          : 'text-midnight_text hover:bg-gray-100 dark:hover:bg-darkmode dark:text-white'
                      )}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'de' | 'ar')}
            className={cn(
              'text-sm border rounded-md px-2 py-1 cursor-pointer transition-colors',
              !isScrolled && isHomePage
                ? 'text-white border-white/30 bg-white/10 hover:bg-white/20'
                : 'text-midnight_text dark:text-white border-gray-300 dark:border-dark_border bg-white dark:bg-darkmode hover:bg-gray-50 dark:hover:bg-darklight'
            )}
            aria-label={t('nav.language') || 'Language'}
          >
            <option value="tr">TR</option>
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="ar">AR</option>
          </select>

          {/* Theme Toggle */}
          <button
            aria-label={t('nav.toggleTheme') || 'Toggle theme'}
            onClick={toggleTheme}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-opacity-10',
              !isScrolled && isHomePage
                ? 'text-white hover:bg-white/10'
                : 'text-midnight_text dark:text-white hover:bg-gray-100 dark:hover:bg-darkmode'
            )}
          >
            {isDark ? (
              <svg
                viewBox="0 0 16 16"
                className="h-6 w-6"
                fill="currentColor"
              >
                <path d="M4.50663 3.2267L3.30663 2.03337L2.36663 2.97337L3.55996 4.1667L4.50663 3.2267ZM2.66663 7.00003H0.666626V8.33337H2.66663V7.00003ZM8.66663 0.366699H7.33329V2.33337H8.66663V0.366699V0.366699ZM13.6333 2.97337L12.6933 2.03337L11.5 3.2267L12.44 4.1667L13.6333 2.97337ZM11.4933 12.1067L12.6866 13.3067L13.6266 12.3667L12.4266 11.1734L11.4933 12.1067ZM13.3333 7.00003V8.33337H15.3333V7.00003H13.3333ZM7.99996 3.6667C5.79329 3.6667 3.99996 5.46003 3.99996 7.6667C3.99996 9.87337 5.79329 11.6667 7.99996 11.6667C10.2066 11.6667 12 9.87337 12 7.6667C12 5.46003 10.2066 3.6667 7.99996 3.6667ZM7.33329 14.9667H8.66663V13H7.33329V14.9667ZM2.36663 12.36L3.30663 13.3L4.49996 12.1L3.55996 11.16L2.36663 12.36Z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 23 23"
                className="h-8 w-8"
                fill="currentColor"
              >
                <path d="M16.6111 15.855C17.591 15.1394 18.3151 14.1979 18.7723 13.1623C16.4824 13.4065 14.1342 12.4631 12.6795 10.4711C11.2248 8.47905 11.0409 5.95516 11.9705 3.84818C10.8449 3.9685 9.72768 4.37162 8.74781 5.08719C5.7759 7.25747 5.12529 11.4308 7.29558 14.4028C9.46586 17.3747 13.6392 18.0253 16.6111 15.855Z" />
              </svg>
            )}
          </button>

          {/* CTA Button */}
          <Button
            asChild
            className={cn(
              'hidden lg:block transition-all',
              !isScrolled && isHomePage
                ? 'bg-transparent border border-white text-white hover:bg-white hover:text-primary'
                : 'bg-primary text-white hover:bg-blue-700 dark:hover:bg-blue-600'
            )}
          >
            <Link to="/contact">{t('nav.contact') || 'İletişime Geç'}</Link>
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="block lg:hidden p-2 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X
                className={cn(
                  'h-6 w-6 transition-colors',
                  !isScrolled && isHomePage
                    ? 'text-white'
                    : 'text-midnight_text dark:text-white'
                )}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    'block w-6 h-0.5 transition-colors',
                    !isScrolled && isHomePage ? 'bg-white' : 'bg-midnight_text dark:bg-white'
                  )}
                ></span>
                <span
                  className={cn(
                    'block w-6 h-0.5 transition-colors',
                    !isScrolled && isHomePage ? 'bg-white' : 'bg-midnight_text dark:bg-white'
                  )}
                ></span>
                <span
                  className={cn(
                    'block w-6 h-0.5 transition-colors',
                    !isScrolled && isHomePage ? 'bg-white' : 'bg-midnight_text dark:bg-white'
                  )}
                ></span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-40" />
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={cn(
          'lg:hidden fixed top-0 right-0 h-full w-full bg-white dark:bg-darkmode shadow-lg transform transition-transform duration-300 max-w-xs z-50',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-midnight_text dark:text-white">
            {t('nav.menu') || 'Menu'}
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('nav.closeMenu') || 'Close mobile menu'}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-darkmode transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="text-midnight_text dark:text-white"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col items-start p-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'w-full px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-midnight_text dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-4 w-full pt-4 border-t border-gray-200 dark:border-dark_border">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'tr' | 'en' | 'de' | 'ar')}
              className="w-full text-sm border rounded-md px-2 py-1 bg-white dark:bg-darkmode text-midnight_text dark:text-white border-gray-300 dark:border-gray-700"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="ar">العربية</option>
            </select>
            <Button
              asChild
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                {t('nav.contact') || 'İletişime Geç'}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default CorporateHeader;
