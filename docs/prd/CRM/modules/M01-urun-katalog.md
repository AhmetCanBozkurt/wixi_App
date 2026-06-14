# M01 — Ürün & Katalog

> **Durum:** ✅ Omurga hazır (3 katman) · **Faz:** 0 · **Öncelik:** — · **Detay:** ✔️ Analiz edildi (2026-06-14)
> [← INDEX'e dön](../INDEX.md)

## Kapsam
Ürün kataloğu, kategori hiyerarşisi, marka, varyant, görsel ve ürün yorumları. E-ticaretin operasyonel omurgası — büyük kısmı mevcut ve **3 katmanlı** çalışıyor.

---

## Mimari: 3 Katman (hepsi mevcut)

| Katman | Kim | Backend route kökü | Yetki |
|---|---|---|---|
| 🏢 **Platform Admin** | Süper admin, tüm tenant'lar | `api/v1/admin/ecommerce/*` | Admin |
| 🏪 **Store-Admin** | Mağaza yöneticisi (tenant) | `api/v1/store-admin/*` | Store auth |
| 🌐 **Storefront** | Son müşteri (public) | `api/v1/public/storefront/*` | Anonim (read-only) |

> Per-tenant veri `ECommerceDbContext`'te; tenant `X-Tenant-Slug` header'ından `TenantMiddleware` ile çözülür.

---

## Entity Şekilleri (mevcut — zengin)

| Entity | Öne çıkan alanlar | Durum |
|---|---|---|
| `WixiProduct` | Name, Slug, Short/Description, CategoryId, BrandId, BasePrice, CompareAtPrice, VatRate(20), CostPrice, TrackInventory, MetaTitle/Desc, IsFeatured, Variants[], Media[] | ✅ |
| `WixiCategory` | ParentId (sonsuz derinlik), Children[], Slug, ImageUrl, SortOrder, MetaTitle/Desc | ✅ |
| `WixiBrand` | Name, Slug, LogoUrl, WebsiteUrl, Description | ✅ |
| `WixiProductVariant` | ProductId, Name, SKU, Barcode, Price, CompareAtPrice, StockQuantity, ReservedQuantity, LowStockThreshold, WeightGrams, **AttributesJson** | ✅ |
| `WixiProductMedia` | ProductId, VariantId, Url, ThumbnailUrl, AltText, MediaType (enum), SortOrder | ✅ |

---

## Endpoint Envanteri

### Ürün
| Katman | Endpoint | Metotlar |
|---|---|---|
| Admin | `api/v1/admin/ecommerce/products` | GET · POST · PUT{id} · DELETE{id} |
| Store-Admin | `api/v1/store-admin/products` | GET · GET{slug} · POST · PUT{id} · DELETE{id} |
| Storefront | `api/v1/public/storefront/products` | GET · GET{slug} |

### Kategori
| Katman | Endpoint | Metotlar |
|---|---|---|
| Admin | `api/v1/admin/ecommerce/categories` | GET · POST · PUT{id} · DELETE{id} |
| Store-Admin | `api/v1/store-admin/categories` | GET · POST · PUT{id} · DELETE{id} |
| Storefront | `api/v1/public/storefront/categories` | GET |

### Marka
| Katman | Endpoint | Metotlar |
|---|---|---|
| Admin | `api/v1/admin/ecommerce/brands` | GET · POST · PUT{id} · DELETE{id} |
| Store-Admin | `api/v1/store-admin/brands` | GET · POST · PUT{id} · DELETE{id} |
| Storefront | `api/v1/public/storefront/brands` | GET |

### Varyant (Store-Admin, nested)
| Endpoint | Metot |
|---|---|
| `api/v1/store-admin/products/{productId}/variants` | GET · POST |
| `api/v1/store-admin/variants/{id}` | PUT · DELETE |

### Görsel
Ürün create/update içinde + ayrı upload: `POST api/v1/store-admin/upload` (multipart, `wwwroot/uploads/{tenantSlug}/`).

> **⚠️ Dosya saklama kuralı (INDEX karar #6, 2026-06-14):** Harici/tam URL string **yasak**. Dosyalar VARBINARY ya da sunucu yüklemesi + **`relativePath`** (host'a bağlı değil). Mevcut `WixiProductMedia.Url`, `WixiBrand.LogoUrl`, `WixiCategory.ImageUrl` **tam URL** tutuyor → relativePath'e migrate edilmeli. `StoreAdminUploadController` tam URL yerine relativePath döndürecek şekilde güncellenmeli. Varsayılan: görseller → sunucu disk + relativePath; küçük/hassas belge → VARBINARY. Tümü `WixiFile` ile izlenir.

---

## Frontend Envanteri

| Katman | Sayfa | Route |
|---|---|---|
| Platform Admin | `ECommerceProductsPage` / `ECommerceCategoriesPage` / `ECommerceBrandsPage` | `/admin/ecommerce/{products,categories,brands}` |
| Store-Admin | `StoreProductsPage` / `StoreCategoriesPage` / `StoreBrandsPage` | `/store-admin/{products,categories,brands}` |
| Storefront | `StorefrontProductDetailPage` / `StorefrontCategoryPage` | `/product/:slug` · `/category/:slug` |

---

## Gap Analizi (ideal §2 vs mevcut)

| İhtiyaç (ideal/iş dökümanı) | Durum | Not |
|---|---|---|
| Kategori/Marka/Ürün/Varyant CRUD | ✅ | 3 katman tam |
| Varyant özellikleri | 🟡 | `AttributesJson` (ayrı `ECOM_VARIANT_ATTRIBUTES` tablosu değil) — filtreleme gerekince normalize |
| Ürün görselleri | ✅ | `WixiProductMedia` |
| SEO meta | ✅ | Product + Category |
| **Ürün yorumları** (`ECOM_PRODUCT_REVIEWS`) | ❌ | Entity/endpoint/sayfa yok |
| **Çok dilli ürün** | 🟡 | Store ayarında `SupportedLanguages`/`DefaultLanguage` var; ama **ürün-seviye çeviri tablosu yok** (Name/Description tek dil) |
| **Toplu import/export** (Excel/CSV) | ❌ | Hiç yok (iş dökümanı §2.1 istiyor) |
| **Gümrük/B2B referans kopyası** (HsCode, UnitName, PackageTypeName) | ❌ | Ürün-seviye yok — M10 Tedarik / M12 İhracat fatura için gerekecek |
| Yayın tarihi (`PublishedAt`) | ❌ | Sadece `IsActive` var; zamanlı yayın yok |
| Çok para birimli ürün | 🟡 | Para birimi tenant default; ürün-seviye `CurrencyCode` yok |

---

## Bağımlılıklar
M00 (birim, HS kod, marka referansları). Besler: M06 Sipariş, M07 Stok, M10 Tedarikçi.

## Açık Sorular
- Varyant özellikleri JSON mu kalsın, normalize mi? (filtreleme/raporlama ihtiyacına göre — karar M13'ü etkiler)
- Çok dilli ürün gerçek ihtiyaç mı? (store çoklu dil destekliyor ama ürün tek dil) → `WixiProductTranslation` eklensin mi?
- Ürün yorumları hangi faz? (öneri: Faz 4, storefront ile)

## Detay Tasarım (TODO)
- [x] 3 katmanlı mimari + endpoint + frontend envanteri çıkarıldı
- [ ] **`WixiProductReview`** entity + CQRS + store-admin onay paneli + storefront yorum formu (OrderItem bağı — sadece satın alana)
- [ ] **Toplu import/export** pipeline (Excel/CSV — EPPlus/CsvHelper) + store-admin sayfası
- [ ] Ürün-seviye **referans kopya alanları** (HsCode, UnitName, PackageTypeName) — M10/M12 öncesi
- [ ] **Çok dilli ürün** kararı → gerekiyorsa `WixiProductTranslation` + endpoint genişletme
- [ ] `PublishedAt` (zamanlı yayın) alanı
- [ ] Varyant attribute normalize kararı (`ECOM_VARIANT_ATTRIBUTES`)
- [ ] **Dosya saklama migrasyonu** (INDEX karar #6): `Url`/`LogoUrl`/`ImageUrl` tam URL → relativePath; `StoreAdminUploadController` relativePath döndürsün; `WixiFile` ile izleme
