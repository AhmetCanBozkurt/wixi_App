import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, LayoutDashboard, FileText, UserCircle, HelpCircle, Moon, Sun, Globe, CreditCard, Shield } from 'lucide-react';
import { TokenService } from '../../ApiServices/services/TokenService';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { useI18n } from '../../hooks/useI18n';
import { PreferenceService } from '../../ApiServices/services/PreferenceService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const ClientLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language, setLanguage, translate } = useI18n();
  const [userName, setUserName] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize dark mode on mount and sync from user preferences if available
  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let shouldBeDark = saved ? saved === 'dark' : prefersDark;
      try {
        const token = await TokenService.getInstance().getToken();
        const hasToken = !!token;
        if (hasToken) {
          const pref = await PreferenceService.getMe();
          if (pref?.theme === 'dark' || pref?.theme === 'light') {
            shouldBeDark = pref.theme === 'dark';
          }
        }
      } catch {}
      setIsDark(shouldBeDark);
      const root = document.documentElement;
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    init();
  }, []);

  // Update dark mode when state changes - with debounce to prevent multiple requests
  useEffect(() => {
    const root = document.documentElement;
    // Smooth transition for dark mode
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Debounce server update to prevent multiple rapid requests
    const timeoutId = setTimeout(async () => {
      try {
        const token = await TokenService.getInstance().getToken();
        const hasToken = !!token;
        if (hasToken) {
          await PreferenceService.updateMe({ theme: isDark ? 'dark' : 'light' }).catch(() => {});
        }
      } catch {}
    }, 500); // Wait 500ms before updating to server
    
    // Remove transition after animation completes
    setTimeout(() => {
      root.style.transition = '';
    }, 300);
    
    // Cleanup timeout on unmount or when isDark changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isDark]);

  useEffect(() => {
    // Get user info from token
    const fetchUserInfo = async () => {
      try {
        const token = await TokenService.getInstance().getToken();
        if (token) {
          // Decode JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload in ClientLayout:', payload);
          
          // Try different claim keys
          const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] 
            || payload['name']
            || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
            || payload['email']
            || 'Danışan Kullanıcı';
          
          console.log('Extracted user name:', name);
          setUserName(name);
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
        setUserName('Danışan Kullanıcı');
      }
    };
    fetchUserInfo();
  }, []);

  const handleLanguageChange = async (lang: "de" | "tr" | "en" | "ar") => {
    setLanguage(lang);
    try {
      const token = await TokenService.getInstance().getToken();
      const hasToken = !!token;
      if (hasToken) {
        await PreferenceService.updateMe({ language: lang }).catch(() => {});
      }
    } catch (e) {
      // no-op: user may be unauthenticated; UI already updates locally
    }
  };

  const handleLogout = async () => {
    try {
      TokenService.getInstance().clearTokens();
      toast({
        title: translate('client.layout.logoutSuccessTitle', 'Çıkış Başarılı'),
        description: translate('client.layout.logoutSuccessDesc', 'Güvenli bir şekilde çıkış yaptınız.'),
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/client/dashboard', key: 'client.nav.dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
    { path: '/client/documents', key: 'client.nav.documents', fallback: 'Belgeler', icon: FileText },
    { path: '/client/profile', key: 'client.nav.profile', fallback: 'Profil', icon: UserCircle },
    { path: '/client/license-info', key: 'client.nav.licenseInfo', fallback: 'Lisans Bilgileri', icon: Shield },
    { path: '/client/support', key: 'client.nav.support', fallback: 'Destek', icon: HelpCircle },
  ];

  // Check if current path is equivalency fee payment to highlight it
  const isEquivalencyPaymentPage = location.pathname === '/client/equivalency-fee-payment';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/client/dashboard" className="flex items-center gap-3">
              <img
                src="/worklines-logo.jpeg"
                alt="Worklines Logo"
                className="h-10 w-auto rounded-lg shadow-lg bg-white p-1 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Worklines</h1>
                <p className="text-xs text-slate-600 dark:text-gray-400">
                  {translate('client.layout.subtitle', 'Danışan Paneli')}
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {translate(item.key, item.fallback)}
                </Link>
              ))}
              {isEquivalencyPaymentPage && (
                <Link
                  to="/client/equivalency-fee-payment"
                  className="text-sm font-medium transition-colors text-blue-600 dark:text-blue-400"
                >
                  {translate('client.nav.equivalencyPayment', 'Denklik Ödemesi')}
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-sm font-medium border border-gray-200 dark:border-gray-700"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {language === 'tr' ? '🇹🇷 Türkçe' :
                       language === 'en' ? '🇬🇧 English' :
                       language === 'de' ? '🇩🇪 Deutsch' :
                       '🇸🇦 العربية'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('tr')}
                    className={language === 'tr' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    🇹🇷 Türkçe
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('en')}
                    className={language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('de')}
                    className={language === 'de' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    🇩🇪 Deutsch
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('ar')}
                    className={language === 'ar' ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  >
                    🇸🇦 العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-2 text-sm font-medium border border-gray-200 dark:border-gray-700"
                title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
              </Button>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/client/profile')}>
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{translate(item.key, item.fallback)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;

