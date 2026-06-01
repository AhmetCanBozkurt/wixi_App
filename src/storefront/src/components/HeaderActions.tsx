'use client';

import { useStore } from '@/lib/store';
import { ShoppingCart, User, LogOut, LogIn, Sun, Moon, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function HeaderActions() {
  const { cart, setCartOpen, customer, logout } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'tr' | 'en'>('tr');

  // Hydration fix for Zustand persist
  useEffect(() => {
    setMounted(true);
    // Dark mode check
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all dark:text-gray-400 dark:hover:text-blue-400"
        title={theme === 'light' ? 'Koyu Tema' : 'Açık Tema'}
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      {/* Language Selector */}
      <button 
        onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
        className="flex items-center gap-1 p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all dark:text-gray-400"
        title="Dil Değiştir"
      >
        <Globe className="h-5 w-5" />
        <span className="text-[10px] font-bold uppercase">{lang}</span>
      </button>

      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1" />

      {/* User Auth */}
      {customer ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Hesabım</p>
            <p className="text-sm font-bold text-gray-900 truncate max-w-[80px]">{customer.firstName}</p>
          </div>
          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all">
              <User className="h-6 w-6" />
            </button>
            {/* Simple Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-4 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Müşteri Hesabı</p>
                <p className="text-sm font-bold text-gray-900 truncate">{customer.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Siparişlerim</button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Profil Ayarları</button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Giriş</span>
          </button>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
      )}

      {/* Cart Trigger */}
      <button 
        onClick={() => setCartOpen(true)}
        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all relative"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center animate-in zoom-in duration-300">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
