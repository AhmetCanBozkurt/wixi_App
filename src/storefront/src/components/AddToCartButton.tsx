'use client';

import { useStore } from '@/lib/store';
import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  mainImageUrl?: string;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, setCartOpen } = useStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      image: product.mainImageUrl,
    });
    
    setAdded(true);
    setCartOpen(true);
    
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
        added 
          ? 'bg-green-500 text-white shadow-green-100' 
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
      }`}
    >
      {added ? (
        <>
          <Check className="w-6 h-6 animate-in zoom-in duration-300" />
          <span>Sepete Eklendi!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-6 h-6" />
          <span>Sepete Ekle</span>
        </>
      )}
    </button>
  );
}
