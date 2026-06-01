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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR - Trendyol Style */}
          <aside className="lg:col-span-3 space-y-8">
            {/* Categories Filter */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5 border-b pb-3">Kategoriler</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/"
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex justify-between items-center ${
                    !selectedCategoryId 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tüm Ürünler
                </Link>
                {categories
                  .filter(cat => cat.name.toLowerCase() !== 'ana sayfa' && cat.name.toLowerCase() !== 'tümü')
                  .map((cat) => (
                  <Link 
                    key={cat.id}
                    href={`/?category=${cat.id}`}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex justify-between items-center ${
                      selectedCategoryId === cat.id 
                        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Filter (Placeholder) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5 border-b pb-3">Fiyat Aralığı</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input type="number" placeholder="En az" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <input type="number" placeholder="En çok" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">Uygula</button>
              </div>
            </div>

            {/* Brand Filter (Placeholder) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5 border-b pb-3">Markalar</h3>
              <div className="space-y-3">
                {['Apple', 'Samsung', 'Logitech', 'Sony'].map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT - Products Grid */}
          <main className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategoryId 
                    ? `${categories.find(c => c.id === selectedCategoryId)?.name || 'Kategori'} Ürünleri` 
                    : 'Tüm Ürünler'}
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">{products.length} ürün listeleniyor</p>
              </div>
              
              <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-500">
                <option>Önerilen Sıralama</option>
                <option>En Düşük Fiyat</option>
                <option>En Yüksek Fiyat</option>
                <option>En Yeniler</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="text-gray-300 mb-4 flex justify-center"><ShoppingCart size={64} /></div>
                <p className="text-gray-500 font-medium">Bu kriterlere uygun ürün bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden">
                      {product.mainImageUrl ? (
                        <img 
                          src={product.mainImageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          Resim Yok
                        </div>
                      )}
                      {/* Badge (Placeholder) */}
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        %20 İndirim
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                          {product.categoryName || 'Genel'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{product.brandName || 'Wixi'}</div>
                      </div>
                      
                      <h3 className="text-md font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors" title={product.name}>
                        <Link href={`/products/${product.slug}`}>
                          {product.name}
                        </Link>
                      </h3>
                      
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">{(product.basePrice * 1.2).toFixed(0)} ₺</span>
                          <span className="text-2xl font-black text-gray-900">{product.basePrice} ₺</span>
                        </div>
                        <button className="p-3 bg-gray-900 text-white rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 group-hover:rotate-[-5deg]">
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
