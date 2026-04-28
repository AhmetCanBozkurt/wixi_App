'use client';

import { useStore } from '@/lib/store';
import { ShoppingBag, ChevronLeft, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = total > 500 ? 0 : 49.90;

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Mock processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    clearCart();
    alert("Siparişiniz başarıyla alındı! Teşekkür ederiz.");
    router.push('/');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 mx-auto">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
        <p className="text-gray-500 mb-8">Ödeme yapabilmek için sepetinize en az bir ürün eklemelisiniz.</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Alışverişe Başla</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ödeme Sayfası</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-8 space-y-6">
            <form id="checkout-form" onSubmit={handleCompleteOrder} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Teslimat Bilgileri</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ad Soyad</label>
                    <input required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ahmet Yılmaz" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Telefon</label>
                    <input required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="0555 --- -- --" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Adres</label>
                    <textarea required className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px]" placeholder="Mahalle, sokak, no, daire..." />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Ödeme Yöntemi</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-blue-500 bg-blue-50/30 rounded-2xl flex items-center gap-4 cursor-pointer">
                    <div className="w-6 h-6 rounded-full border-4 border-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Kredi / Banka Kartı</p>
                      <p className="text-xs text-gray-500">Güvenli ödeme altyapısı ile</p>
                    </div>
                  </div>
                  <div className="p-4 border-2 border-gray-100 bg-white rounded-2xl flex items-center gap-4 cursor-not-allowed opacity-50">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900">Kapıda Ödeme</p>
                      <p className="text-xs text-gray-500">Geçici olarak devre dışı</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Kart Numarası</label>
                    <input className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono" placeholder="**** **** **** ****" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Son Kullanma</label>
                      <input className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="AA / YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">CVV</label>
                      <input className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" placeholder="***" />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 uppercase">Görsel Yok</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.quantity} Adet x {item.price} ₺</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ara Toplam</span>
                  <span className="font-bold text-gray-900">{total.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kargo</span>
                  <span className={`font-bold ${shipping === 0 ? 'text-green-500' : 'text-gray-900'}`}>
                    {shipping === 0 ? 'Ücretsiz' : `${shipping.toFixed(2)} ₺`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t border-gray-100">
                  <span className="text-gray-900">Toplam</span>
                  <span className="text-blue-600">{(total + shipping).toFixed(2)} ₺</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
              >
                {isProcessing ? 'İşleniyor...' : 'Siparişi Tamamla'}
              </button>

              <div className="flex items-center justify-center gap-2 mt-6">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">256-Bit SSL Güvenli Ödeme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
