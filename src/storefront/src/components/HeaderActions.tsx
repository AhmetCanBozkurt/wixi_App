'use client';

import { useStore } from '@/lib/store';
import { ShoppingCart, User, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function HeaderActions() {
  const { cart, setCartOpen, customer, logout } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Hydration fix for Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex items-center space-x-4">
      {/* User Auth */}
      {customer ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-400 font-medium">Hoş geldiniz,</p>
            <p className="text-sm font-bold text-gray-900">{customer.firstName}</p>
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>Giriş Yap</span>
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
