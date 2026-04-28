import { fetchServerApi, getTenantSlugFromServer } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryName?: string;
  brandName?: string;
  mainImageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ category?: string }> 
}) {
  const { category: selectedCategoryId } = await searchParams;
  const tenantSlug = await getTenantSlugFromServer();

  let products: Product[] = [];
  let categories: Category[] = [];
  let errorMsg = '';

  if (!tenantSlug) {
    errorMsg = "Geçerli bir mağaza bulunamadı.";
  } else {
    try {
      // Fetch categories
      categories = await fetchServerApi<Category[]>('storefront/categories', {
        next: { revalidate: 300 }
      });

      // Fetch products with optional category filter
      const productEndpoint = selectedCategoryId 
        ? `storefront/products?CategoryId=${selectedCategoryId}`
        : 'storefront/products';
        
      const data = await fetchServerApi<{ items: Product[] }>(productEndpoint, {
        next: { revalidate: 60 }
      });
      products = data.items || [];
    } catch (error: any) {
      errorMsg = "Veriler yüklenirken bir hata oluştu: " + error.message;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Banner (Placeholder) */}
      <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 mb-12 text-center text-white shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 capitalize">
          {tenantSlug ? `${tenantSlug} Mağazasına Hoş Geldiniz` : "Mağaza Bulunamadı"}
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
          En yeni koleksiyonları keşfedin ve güvenle alışveriş yapın.
        </p>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center border border-red-200">
          <p className="font-medium">{errorMsg}</p>
        </div>
      ) : (
        <div>
          {/* Category Filter UI */}
          <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <Link 
              href="/"
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${
                !selectedCategoryId 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
              }`}
            >
              Tümü
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id}
                href={`/?category=${cat.id}`}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${
                  selectedCategoryId === cat.id 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategoryId 
                ? `${categories.find(c => c.id === selectedCategoryId)?.name || 'Kategori'} Ürünleri` 
                : 'Öne Çıkan Ürünler'}
            </h2>
            <span className="text-sm text-gray-400 font-medium">{products.length} Ürün Listeleniyor</span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200 border-dashed">
              <p className="text-gray-500">Henüz hiç ürün eklenmemiş.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    {product.mainImageUrl ? (
                      <img 
                        src={product.mainImageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        Resim Yok
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">
                      {product.categoryName || 'Kategorisiz'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={product.name}>
                      <Link href={`/products/${product.slug}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{product.brandName || 'Markasız'}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-bold text-gray-900">{product.basePrice} ₺</span>
                      <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors" title="Sepete Ekle">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
