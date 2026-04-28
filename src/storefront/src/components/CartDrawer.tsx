'use client';

import { useStore } from '@/lib/store';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeItem, updateQuantity } = useStore();

  if (!isCartOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-500 sm:duration-700 translate-x-0">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Sepetim ({cart.length})</h2>
            </div>
            <button 
              onClick={() => setCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500">Sepetiniz şu an boş.</p>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="mt-4 text-blue-600 font-semibold hover:underline"
                >
                  Alışverişe Başla
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    {/* Placeholder Image */}
                    <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">Resim Yok</div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-sm font-bold text-blue-600 mb-3">{item.price} ₺</p>
                      
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-blue-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Checkout */}
          {cart.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Ara Toplam</span>
                <span className="text-xl font-extrabold text-gray-900">{total.toFixed(2)} ₺</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Kargo ve vergiler ödeme adımında hesaplanacaktır.</p>
              
              <div className="space-y-3">
                <Link 
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Ödemeye Geç
                </Link>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
