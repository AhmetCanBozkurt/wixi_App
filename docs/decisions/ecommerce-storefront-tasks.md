# WIXI E-Ticaret Storefront — Görev Listesi

> **Kaynak:** `ECOMMERCE_ANALYSIS.md`
> **Son Güncelleme:** 2026-05-16
> **Durum Etiketleri:** `[ ]` Bekliyor · `[~]` Devam Ediyor · `[x]` Tamamlandı · `[!]` Bloklandı

---

## FAZ 1 — Kritik Bug Düzeltmeleri (Navbar & Filtre)

### 🧭 Navbar

| ID | Görev | Dosya(lar) | Durum |
|----|-------|-----------|-------|
| N-1 | Ana Sayfa mükerrer link kaldırılması — backend'den gelen menüdeki "Anasayfa" öğesi filtrelenmeli | `StorefrontNavbar.tsx` | [x] |
| N-2 | Dark/Light mode toggle eklenmesi — `ThemeProvider.toggle()` bağlanacak, localStorage kalıcı | `StorefrontNavbar.tsx`, `ThemeProvider.tsx` | [x] |
| N-3 | Dil seçici eklenmesi — TR/EN, `localStorage.lng` + API `Accept-Language` header | `StorefrontNavbar.tsx` | [x] |
| N-4 | Mobil hamburger: dışarı tıklayınca kapanma | `StorefrontNavbar.tsx` | [x] |
| N-5 | Sepet ikon sayacı — Zustand `cartCount` state bağlantısı | `StorefrontNavbar.tsx` | [x] |

### 🔍 Filtre / Sidebar

| ID | Görev | Dosya(lar) | Durum |
|----|-------|-----------|-------|
| F-1 | Trendyol benzeri sidebar bileşeni sıfırdan oluşturma | `ProductFilterSidebar.tsx` (yeni) | [x] |
| F-2 | URL tabanlı filtre state — `useSearchParams` ile `?brand=X&minPrice=100` | `StorefrontProductsPage.tsx` | [x] |
| F-3 | Fiyat range slider — debounce 400ms, min/max input | `PriceRangeSlider.tsx` (yeni) | [x] |
| F-4 | Marka checkbox listesi — `GET /store-admin/brands` verisi, içinde marka arama | `BrandFilterList.tsx` (yeni) | [x] |
| F-5 | Backend: sort parametresi eklenmesi — `?sortBy=price_asc\|price_desc\|newest\|recommended` | `GetProductsQuery.cs` | [x] |
| F-6 | Aktif filtre chip'leri — header'da "×" ile kaldırılabilir etiketler | `ActiveFilterChips.tsx` (yeni) | [x] |
| F-7 | Mobil filtre drawer — alttan açılan sheet, desktop'ta statik | `ProductFilterSidebar.tsx` | [x] |

---

## FAZ 2 — Ürün Tanımlama & Varyant İyileştirmeleri

| ID | Görev | Dosya(lar) | Durum |
|----|-------|-----------|-------|
| P-1 | Dinamik ürün nitelikleri (Attributes) — `AttributesJson` alanını UI'da yönet | `StoreProductsPage.tsx` | [x] |
| P-2 | Renk seçici (hex) ürün varyantta | `StoreProductsPage.tsx` | [x] |
| P-3 | KDV oranı alanı ürün formuna eklenmesi (%1, %10, %20) | `StoreProductsPage.tsx`, `UpdateProductCommand.cs` | [x] |
| P-4 | Alış fiyatı (cost price) alanı eklenmesi | `WixiProduct.cs`, `StoreProductsPage.tsx` | [x] |
| P-5 | Ürün detay sayfası (Storefront) — variant seçici (beden/renk butonları) | `StorefrontProductDetailPage.tsx` | [x] |

---

## FAZ 3 — Depo & Stok Mimarisi (Backend)

| ID | Görev | Dosya(lar) | Durum |
|----|-------|-----------|-------|
| W-1 | `WixiWarehouse` entity + migration | `WixiWarehouse.cs`, migration | [x] |
| W-2 | `WixiStock (VariantId, WarehouseId, Quantity)` pivot tablosu | `WixiStock.cs`, migration | [x] |
| W-3 | `WixiStockMovement` — GRN, SALE, RTN, TRF tipleri | `WixiStockMovement.cs` | [x] |
| W-4 | `StockQuantity` alanını `WixiProductVariant`'tan kaldırma (deprecate) | `WixiProductVariant.cs` | [~] |
| W-5 | Stok giriş ekranı (Admin UI) | `StoreStockPage.tsx` (yeni) | [x] |
| W-6 | Depo bazlı ürün raporu ekranı | `StoreWarehouseReportPage.tsx` (yeni) | [x] |

---

## FAZ 4 — Cari (Tedarikçi / B2B) Modülü

| ID | Görev | Dosya(lar) | Durum |
|----|-------|-----------|-------|
| C-1 | `WixiContact` (Cari) entity — Type: Tedarikçi/Müşteri/Bayi | `WixiContact.cs` | [x] |
| C-2 | `WixiCariLedger` — Borç/Alacak hareketleri | `WixiCariLedger.cs` | [x] |
| C-3 | Cari yönetim ekranı (Admin UI) | `StoreCariPage.tsx` (yeni) | [x] |

---

## FAZ 5 — Kargo & Adres Entegrasyonu

| ID | Görev | Dosya(lar) | Durum |
|----|-------|-----------|-------|
| K-1 | Çoklu adres defteri — Teslimat / Fatura ayrımı | `WixiAddress.cs` | [x] |
| K-2 | İl/İlçe/Mahalle veri seeding veya API | `SeedData.cs` | [x] |
| K-3 | Kargo firmaları entegrasyon altyapısı (Aras, Yurtiçi vb.) | `ICargoProvider.cs` | [x] |
| K-4 | Sipariş durum akışı (Hazırlanıyor → Kargoda → Teslim) | `WixiOrder.cs`, Storefront | [x] |

---

## FAZ 6 — Platform Vizyonu (Gelecek Faz)

| ID | Görev | Notlar | Durum |
|----|-------|--------|-------|
| V-1 | Dinamik kupon / kampanya motoru | Sepet kuralları, limitli kodlar | [ ] |
| V-2 | Satış analitik dashboard | Isı haritası, ciro raporu | [ ] |
| V-3 | Merkezi medya yöneticisi | Otomatik thumbnail, CDN | [ ] |
| V-4 | CMS — KVKK, İptal/İade, Blog | Admin panel bağlantısı | [ ] |
| V-5 | Müşteri sadakat sistemi | Favoriler, Wixi Puan | [ ] |

---

## Notlar

- **Faz 1 acil** — Storefront şu an navbar duplikasyonu ve sıfır filtre ile yayında.
- **Faz 2 + 3 bağımlılığı** — Varyant formuna özellik eklemeden depo mimarisi kurulmamalı.
- **Faz 3 önce migration planla** — `WixiProductVariant.StockQuantity` kolay kaldırılamaz; önce `WixiStock` dolacak, sonra eski alan deprecated edilecek.
