import { fetchServerApi, getTenantSlugFromServer } from "@/lib/api";
import { ChevronRight, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryName?: string;
  brandName?: string;
  description?: string;
  mainImageUrl?: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenantSlug = await getTenantSlugFromServer();

  let product: Product | null = null;
  let errorMsg = '';

  try {
    product = await fetchServerApi<Product>(`storefront/products/${slug}`, {
      next: { revalidate: 30 }
    });
  } catch (error: any) {
    errorMsg = "Ürün yüklenemedi. Belki silinmiş veya yayından kaldırılmış olabilir.";
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h2>
        <p className="text-gray-500 mb-8">{errorMsg || "Aradığınız ürün mevcut değil."}</p>
        <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Mağazaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{product.categoryName || 'Kategori'}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-400 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/5] bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-center text-gray-300 text-lg font-bold overflow-hidden shadow-inner bg-white">
               {product.mainImageUrl ? (
                 <img 
                   src={product.mainImageUrl} 
                   alt={product.name}
                   className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                 />
               ) : (
                 "Ürün Görseli"
               )}
            </div>
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="aspect-square bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 text-[10px]">Görsel {i}</div>
               ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-extrabold text-blue-600 uppercase tracking-widest mb-2">{product.brandName || 'Markasız'}</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current text-gray-200" />
                </div>
                <span className="text-sm text-gray-400 font-medium">(12 Değerlendirme)</span>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-black text-gray-900">{product.basePrice} ₺</span>
                <span className="text-lg text-gray-400 line-through">{(product.basePrice * 1.2).toFixed(2)} ₺</span>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold">%20 İndirim</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10 text-gray-600 leading-relaxed space-y-4">
               <p>{product.description || "Bu ürün hakkında henüz detaylı bir açıklama girilmemiş. Şık tasarımı ve kaliteli materyalleri ile stilinize renk katmaya hazır."}</p>
            </div>

            {/* Add to Cart Actions */}
            <div className="mt-auto space-y-6">
              <AddToCartButton product={product} />
              
              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Hızlı Kargo</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Güvenli Ödeme</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Kolay İade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
