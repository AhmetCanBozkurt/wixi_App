# WIXI Sistem Yenileme - Otonom Görev Takip Listesi

Buradaki görevler otonom asistan (Antigravity) tarafından projenin fazlarına göre güncellenecektir. İşaretlemeler:
- `[ ]` Yapılacak
- `[/]` Devam Ediyor
- `[x]` Tamamlandı

> [!NOTE]
> Proje takibi artık **Linear** ile senkronize edilmektedir. Görevlerin detaylarına Linear linklerinden ulaşabilirsiniz.

---

## 🚀 FAZ 1: Çekirdek Altyapı ve Kimlik Doğrulama Döngüsü (Auth Cycle)
*Amacımız; sistemin temellerini atmak, DB bağlantılarını sağlamak ve bir kullanıcının sorunsuzca sisteme giriş/çıkış yapmasını garantilemektir.*

- `[x]` **Backend:** `WixiDbContext` dosyasının analizi ve WIXI_USERS, WIXI_ROLES tablolarının ana hatlarıyla kurumsal şemaya (Audit field'lar vs.) oturtulması. [[WIX-9](https://linear.app/wixisoftware/issue/WIX-9/faz-1-db-sema-analizi-ve-audit-entegrasyonu)]
- `[x]` **Backend:** Veritabanı (SQL Server) migration'ının oluşturulması, temel DB bağlantılarının test edilmesi ve Default Admin kullanıcısı (Seed Data) yaratılması. [[WIX-10](https://linear.app/wixisoftware/issue/WIX-10/faz-1-migration-ve-seed-data-olusturma)]
- `[x]` **Backend:** `Program.cs` içerisindeki hardcoded bağımlılıkların temizlenmesi ve Login / Register API endpoint'lerinin (CQRS/MediatR mantığıyla) netleştirilmesi. [[WIX-11](https://linear.app/wixisoftware/issue/WIX-11/faz-1-backend-bagimlilik-temizligi-ve-cqrs-entegrasyonu)]
- `[x]` **Frontend:** FSD (Feature-Sliced Design) klasör hiyerarşisinin `src/` altına oluşturulması. [[WIX-12](https://linear.app/wixisoftware/issue/WIX-12/faz-1-frontend-fsd-mimari-kurulumu)]
- `[x]` **Frontend:** Base Axios config ve Vanilla CSS (Glassmorphism) temel framework'ünün `shared` katmanına yerleştirilmesi. [[WIX-13](https://linear.app/wixisoftware/issue/WIX-13/faz-1-base-axios-ve-glassmorphism-ui-framework)]
- `[x]` **Frontend:** `entities/User` altında global state (Zustand veya Context) tasarımının yapılması. [[WIX-14](https://linear.app/wixisoftware/issue/WIX-14/faz-1-global-user-state-yonetimi-zustand)]
- `[x]` **Frontend:** `features/Auth` altında Login Form bileşeninin yazılması ve API'ye bağlanması. [[WIX-15](https://linear.app/wixisoftware/issue/WIX-15/faz-1-login-form-ve-auth-entegrasyonu)]
- `[x]` **Frontend:** `pages/LoginPage` ve `pages/DashboardPage` router entegrasyonu, Auth Guard (korumalı route) ile test. [[WIX-16](https://linear.app/wixisoftware/issue/WIX-16/faz-1-router-entegrasyonu-ve-auth-guard-kurulumu)]

---

## 🔐 FAZ 2: Gelişmiş Loglama, Dinamik Menü ve UI Taşıma (Migration)
*Amacımız; giriş/çıkış Audit loglarını (IP, Tarayıcı ile) sisteme kazandırmak ve eski projedeki Admin Layout (Sidebar) & DataTable bileşenlerini yepyeni Vanilla CSS kurallarıyla FSD mimarisine taşımaktır.*

- `[x]` **Backend:** `WixiAuditLog` tablosunun modellenerek Login/Logout (Auth) evrelerine eklenmesi (Müşteri detaylı loglama/IP vs.). [[WIX-17](https://linear.app/wixisoftware/issue/WIX-17/faz-2-audit-log-altyapisi-ve-entegrasyonu)]
- `[x]` **Frontend:** Eski projedeki `AdvancedDataTable.tsx` yapısının alınarak `shared/ui` katmanında CQRS formatına uyumlu Premium Glassmorphism olarak refactor edilmesi. [[WIX-18](https://linear.app/wixisoftware/issue/WIX-18/faz-2-advanceddatatable-refaktoru-premium-glassmorphism)]
- `[x]` **Frontend:** Eski projedeki `AdminLayout.tsx` yapısının (Sidebar ve Header) Tailwind'den temizlenerek `widgets/Sidebar` ve `widgets/Header` dizinlerinde Vanilla CSS modülleriyle canlandırılması. [[WIX-19](https://linear.app/wixisoftware/issue/WIX-19/faz-2-adminlayout-sidebarheader-vanilla-css-donusumu)]
- `[x]` **Backend:** `WIXI_MENUS`, `WIXI_LANGUAGES` ve `WIXI_MENU_TRANSLATIONS` tablolarının tasarlanması ve CRUD uçlarının yazılması. [[WIX-20](https://linear.app/wixisoftware/issue/WIX-20/faz-2-menu-ve-dil-yonetimi-db-tasarimi-crud-api)]
- `[x]` **Frontend:** Menü Yönetim Sayfası, İkon Seçici ve Akıllı Sayfa Seçici (Path Picker) entegrasyonu. [[WIX-21](https://linear.app/wixisoftware/issue/WIX-21/faz-2-menu-yonetim-sayfasi-ve-ikon-secici-entegrasyonu)]
- `[x]` **Frontend:** Global Dil Seçici (Header) ve Dinamik Menü (Sidebar) entegrasyonu. [[WIX-22](https://linear.app/wixisoftware/issue/WIX-22/faz-2-global-dil-secici-ve-dinamik-sidebar-entegrasyonu)]
- `[x]` **Fullstack:** `@dnd-kit` ile Sürükle-Bırak özellikli Kullanıcı Menü Yönetimi Paneli. [[WIX-23](https://linear.app/wixisoftware/issue/WIX-23/faz-2-surukle-birak-kullanici-menu-yonetimi-paneli)]
- `[ ]` **Frontend:** UI tarafında buton gizleme/gösterme mekanizması için `<HasPermission>` hook'u veya wrapper komponentinin yazılması. [[WIX-24](https://linear.app/wixisoftware/issue/WIX-24/faz-2-haspermission-hook-ve-yetki-kontrolu-altyapisi)]

---

## 🛠️ FAZ 3: Ortak Sistem Servisleri (Core Services)
*Amacımız; diğer tüm modüllerin kullanacağı Loglama, Dosya yükleme ve E-Posta atma gibi standart servisleri projeye entegre etmektir.*

- `[x]` **Backend:** Kurumsal Loglama altyapısının (Serilog) kurulması, dosya ve konsol sink entegrasyonu tamamlandı. [[WIX-25](https://linear.app/wixisoftware/issue/WIX-25/faz-3-serilog-ve-db-log-sink-entegrasyonu)]
- `[x]` **Backend:** Dinamik Mail Servisi ve Şablon Yönetimi Altyapısı.
    - `[x]` `WIXI_MAIL_TEMPLATES` ve `WIXI_MAIL_LOGS` tablolarının modellenmesi. [[WIX-44](https://linear.app/wixisoftware/issue/WIX-44/backend-mailing-db-schema-and-auditable-entities)]
    - `[x]` `Scriban` template engine entegrasyonu ve dinamik yer tutucu (placeholder) sistemi. [[WIX-45](https://linear.app/wixisoftware/issue/WIX-45/backend-scriban-template-engine-integration)]
    - `[x]` Arkaplan mail kuyruğu (Background Worker) ve SMTP entegrasyonu. [[WIX-46](https://linear.app/wixisoftware/issue/WIX-46/backend-mail-dispatch-service-and-background-queue)]
- `[x]` **Frontend:** Mail Şablon Yönetimi Sayfası.
    - `[x]` Mail modülü mimarisi ve rotalama kurulumu. [[WIX-47](https://linear.app/wixisoftware/issue/WIX-47/frontend-mailing-module-architecture-and)]
    - `[x]` Şablon listeleme ve "Rich Text / HTML Editor" entegrasyonu. [[WIX-48](https://linear.app/wixisoftware/issue/WIX-48/frontend-template-editor-and-html)]
    - `[x]` Dinamik placeholder yardımcısı ve önizleme (preview) modu.
    - `[x]` Mail Logları ve İzleme Dashboard'u. [[WIX-49](https://linear.app/wixisoftware/issue/WIX-49/frontend-mailing-logs-and-monitoring-dashboard)]
- `[x]` **Backend:** Merkezi Dosya Servisi (`WIXI_FILES`) - Local Storage entegrasyonu tamamlandı. [[WIX-27](https://linear.app/wixisoftware/issue/WIX-27/faz-3-merkezi-dosya-servisi-file-storage)]
- `[x]` **Frontend:** Resim yükleme, Cropper ve Drag&Drop bileşenlerinin eklenmesi. [[WIX-28](https://linear.app/wixisoftware/issue/WIX-28/faz-3-imageupload-cropper-ve-draganddrop-ui-bilesenleri)]

---

## 📝 FAZ 4: Notion Benzeri "Notlar ve Dokümanlar" Modülü
*Amacımız; sistemin ilk spesifik plug-in modülünü sıfırdan ve yeni mimariye (DDD/FSD) uygun şekilde inşa etmektir.*

- `[ ]` **Backend:** `wixi.Modules.Notes` projesinin/klasörünün oluşturulması. [[WIX-29](https://linear.app/wixisoftware/issue/WIX-29/faz-4-notes-modul-proje-yapilandirmasi)]
- `[ ]` **Backend:** `WIXI_NOTES` ve `WIXI_NOTE_CONTENT` tablolarının CRUD uçları. [[WIX-30](https://linear.app/wixisoftware/issue/WIX-30/faz-4-notes-db-tasarimi-ve-crud-api)]
- `[ ]` **Frontend:** `@dnd-kit` ve zengin metin editör (block-editor) yapısı. [[WIX-31](https://linear.app/wixisoftware/issue/WIX-31/faz-4-block-editor-ve-noteeditor-gelistirme)]
- `[ ]` **Frontend:** Multi-user okuma engeli/yetkilerinin uygulanması. [[WIX-32](https://linear.app/wixisoftware/issue/WIX-32/faz-4-not-yetkilendirme-ve-canliya-alim)]

---

## 🔄 FAZ 5: Mevcut Büyük Modüllerin Taşınması (Migration)
*Amacımız; eski sistemde (tightly coupled) çalışan büyük modüllerin yeni sisteme güvenlice taşınmasıdır.*

- `[ ]` **Görev:** `wixi.Tekstil` modülünün izole application katmanı haline getirilmesi. [[WIX-33](https://linear.app/wixisoftware/issue/WIX-33/faz-5-tekstil-modul-migrasyonu)]
- `[ ]` **Görev:** `wixi.CVBuilder` yapısının taşınması. [[WIX-34](https://linear.app/wixisoftware/issue/WIX-34/faz-5-cvbuilder-modul-migrasyonu)]
- `[ ]` **Görev:** `wixi.Appointments` (Randevu) yapısının taşınması. [[WIX-35](https://linear.app/wixisoftware/issue/WIX-35/faz-5-appointments-modul-migrasyonu)]
- `[ ]` **Görev:** `wixi.Clients` yapısının Müşteri Portalı olarak izole edilmesi. [[WIX-36](https://linear.app/wixisoftware/issue/WIX-36/faz-5-clients-modul-migrasyonu-musteri-portali)]

---

## 🎨 FAZ 6: Frontend Optimizasyonu ve Dashboard Cila İşlemleri (Polish)
*Amacımız; sistem altyapısı bittikten sonra "Wow Effect" yaratmak ve performansı köklemektir.*

- `[ ]` **Frontend:** Global Dashboard grafik bileşenlerinin (Widget) oluşturulması. [[WIX-37](https://linear.app/wixisoftware/issue/WIX-37/faz-6-global-dashboard-grafik-widget-gelistirme)]
- `[ ]` **Frontend:** Dark / Light tema mantığının kusursuzlaştırılması. [[WIX-38](https://linear.app/wixisoftware/issue/WIX-38/faz-6-dark-light-tema-optimizasyonu)]
- `[x]` **Frontend:** Tablolar için Generic Data-Table (`AdvancedDataTable`) refaktörü. [[WIX-39](https://linear.app/wixisoftware/issue/WIX-39/faz-6-generic-advanceddatatable-refaktoru)]
- `[x]` **Frontend:** Premium UI Design System temelleri ve `ComponentShowcasePage`. [[WIX-40](https://linear.app/wixisoftware/issue/WIX-40/faz-6-premium-ui-design-system-ve-prototype)]
- `[ ]` **Frontend:** Lighthouse performans testi ve Bundle-size operasyonu. [[WIX-41](https://linear.app/wixisoftware/issue/WIX-41/faz-6-lighthouse-ve-performans-optimizasyonu)]
- `[x]` **Backend:** `IAuditable` interface'inin ve veritabanı modellerinin genişletilmesi. [[WIX-42](https://linear.app/wixisoftware/issue/WIX-42/faz-6-iauditable-genisletme-ve-otomatik-user-audit)]
- `[x]` **Frontend:** `AdvancedDataTable` bileşenine standart Audit sütunlarının eklenmesi. [[WIX-43](https://linear.app/wixisoftware/issue/WIX-43/faz-6-datatable-audit-sutunlari-entegrasyonu)]

---

## 🧪 FAZ 7: Test Otomasyonu ve API Standardizasyonu (TestSprite Alignment)
*Amacımız; sistemin tüm API endpoint'lerini ve frontend test senaryolarını modernize edilmiş backend mimarisiyle (%100 başarı oranıyla) uyumlu hale getirmektir.*

- `[x]` **Backend:** API endpoint yollarının ve veri yapılarının standardizasyonu. [[WIX-5](https://linear.app/wixisoftware/issue/WIX-5/standardize-backend-api-for-test-alignment)]
- `[x]` **Fullstack:** Backend ve Frontend `standard_prd.json` hizalanması. [[WIX-6](https://linear.app/wixisoftware/issue/WIX-6/align-prd-and-test-specifications)]
- `[/]` **Frontend:** `testsprite_tests` altındaki Python test scriptlerinin onarılması. [[WIX-7](https://linear.app/wixisoftware/issue/WIX-7/fix-frontend-python-test-scripts)]
- `[ ]` **Verification:** TestSprite üzerinden tüm testlerin koşturulması ve %100 "Passed" sonucu. [[WIX-8](https://linear.app/wixisoftware/issue/WIX-8/final-test-verification-and-success)]

---

---

## 💱 FAZ 8: Para Birimi Yönetimi Modülü (Currency Management)

*Amacımız; TCMB'den günlük döviz kuru çeken, para birimi CRUD, parite/çapraz parite hesabı ve sistem ana dövizi konfigürasyonu içeren tam bir para birimi yönetim modülü inşa etmektir.*

- `[x]` **Backend:** `WixiCurrency`, `WixiExchangeRate`, `WixiCurrencySetting` entity'lerinin oluşturulması (IAuditable, tablo mapping'leri).
- `[x]` **Backend:** CQRS Commands: `CreateCurrency`, `UpdateCurrency`, `DeleteCurrency` (IsBase koruması), `SetBaseCurrency` (transaction), `SyncTcmbRates` (TCMB entegrasyonu), `UpdateCurrencySettings`.
- `[x]` **Backend:** CQRS Queries: `GetCurrencies`, `GetExchangeRates` (paged), `GetLatestRates`, `GetParity`, `GetCrossParity`, `ConvertAmount`, `GetCurrencySettings`.
- `[x]` **Backend:** `ITcmbExchangeRateService` interface + `TcmbExchangeRateService` implementation (HttpClient, XML parse, 404→Holiday).
- `[x]` **Backend:** `TcmbSyncBackgroundWorker` (BackgroundService, hafta içi 16:00 otomatik sync).
- `[x]` **Backend:** `CurrencyController` — tüm CRUD, settings, exchange-rate, sync, parity, cross-parity, convert endpoint'leri.
- `[x]` **Backend:** EF Core migration: `AddCurrencyManagement` (WIXI_CURRENCIES, WIXI_EXCHANGE_RATES, WIXI_CURRENCY_SETTINGS tabloları, unique index'ler, FK Restrict).
- `[x]` **Backend:** SeedData güncelleme — TRY (IsBase), USD, EUR, GBP + default CurrencySetting + 3 menü (Finans grubu).
- `[x]` **Backend:** Program.cs — IHttpClientFactory TCMB typed client + TcmbSyncBackgroundWorker registration.
- `[x]` **Frontend:** `CurrencyManagementPage` — tablo (kod badge, isBase vurgusu, TCMB takip badge), `CurrencyEditorModal` (sol: Switch'ler + SetBase butonu, sağ: Input alanlar), silme koruması.
- `[x]` **Frontend:** `ExchangeRatePage` — FilterBar (DateInput+MultiSelect), TCMB sync butonu (gradient), AdvancedDataTable, 3 hesaplama kartı (Parite, Çapraz Parite, Dönüştürme).
- `[x]` **Frontend:** `CurrencySettingsPage` — Temel Ayarlar (Select+Switch), Senkronizasyon Durumu (status badge+tarihler), Genel Bilgi kartı.
- `[x]` **Frontend:** App.tsx route entegrasyonu — `/admin/currencies`, `/admin/exchange-rates`, `/admin/currency-settings`.

---

## 🛒 E-Ticaret Modülü (SaaS Altyapısı)

### 🏗️ FAZ E0: Temel Altyapı ve Multi-tenancy - `[x]`
- `[x]` `Wixi.Modules.ECommerce` modülünün oluşturulması.
- `[x]` WIXI_FILES Merkezi Dosya Servisi
- `[x]` Serilog Entegrasyonu
- `[/]` SaaS Multi-Tenant Mimarisi
    - `[x]` WixiTenant Varlığının Core Modülüne Taşınması
    - `[x]` WixiCoreDbContext'in Master DB Görevini Üstlenmesi
    - `[x]` TenantDatabaseProvisioner'ın Modüler Yapıya Kavuşturulması
    - `[x]` SaasOnboardingController API'sinin Yazılması
    - `[x]` ITenantProvisioner arayüzü ve ECommerceTenantProvisioner implementasyonu
    - `[/]` Master Storefront (Landing Page + Onboarding Formu) Sayfasının Hazırlanması
        - `[x]` MasterStorefrontPage UI bileşeni oluşturuldu
        - `[x]` Domain-based routing (localhost → Landing Page, tenant → Admin)
        - `[ ]` Fiyatlandırma planları (Free / Pro / Enterprise) bölümü eklenmesi
        - `[ ]` Tenant Provisioning iş akışının uçtan uca doğrulanması (DB + Seed + Admin kullanıcı)

### 📦 FAZ E1: Ürün Kataloğu (Product Catalog) - `[x]`
- `[x]` Admin panelinde kategori yönetimi (CRUD, hiyerarşik yapı)
- `[x]` Admin panelinde marka yönetimi (CRUD)
- `[x]` Admin panelinde ürün yönetimi (Temel bilgiler, varyantlar, stok durumu)
- `[x]` Ürün, Kategori ve Marka listeleme ekranları (Premium Table yapısıyla)
- `[x]` Ürün çoklu görsel (multi-media) yükleme altyapısı

---

### 🛍️ FAZ E2: Storefront Geliştirme (Next.js) - `[/]`
*Müşterinin tenant subdomain'i üzerinden eriştiği, ürünleri görüp alışveriş yaptığı vitrin.*

- `[x]` Next.js projesinin kurulumu ve Tailwind CSS entegrasyonu
- `[x]` Tenant çözünürlüğü — `X-Tenant-Slug` header'ı ile subdomain bazlı routing (`lib/api.ts`)
- `[x]` Müşteri kayıt ve giriş akışı — `StorefrontAuthController`
- `[x]` Anasayfa, ürün listeleme ve ürün detay sayfaları
- `[x]` Sepet (Cart) state yönetimi — Zustand + localStorage persist (`lib/store.ts`)
- `[x]` Checkout sayfası UI'ı (Mock ödeme formu — kart alanları mevcut, gerçek ödeme yok)
- `[/]` Sepet Drawer bileşeni (`CartDrawer.tsx`) — kısmen tamamlandı
- `[ ]` Kategori ve marka bazlı filtreleme + arama
- `[ ]` Ürün varyant seçimi (renk, beden vb.) storefront gösterimi
- `[ ]` Ürün arama kutusu (header'da) — anlık sonuç dropdown'ı

---

### 💳 FAZ E3: Gerçek Ödeme Entegrasyonu (Iyzipay) - `[ ]`
*`wixi.backend/Iyzipay` klasöründe tam SDK mevcut (~120 model/request dosyası). Checkout sayfası hâlâ mock `setTimeout` kullanıyor.*

#### Backend
- `[ ]` `Iyzipay` projesini `Wixi.Modules.ECommerce.csproj`'e proje referansı olarak ekleme
- `[ ]` `IPaymentService` arayüzü — `Core/Application/Common/Interfaces` altında
- `[ ]` `IyzipayPaymentService` implementasyonu — `ECommerce/Infrastructure/Services` altında
    - `Options` (ApiKey, SecretKey, BaseUrl) → `appsettings.json` `IyzipaySettings` section'ından
    - `CreateCheckoutFormInitializeRequest` → `Buyer` (müşteri bilgileri, TC no zorunlu), `BasketItems` (sepetten), `ShippingAddress`, `BillingAddress`, `CallbackUrl`
    - Sonuç: `checkoutFormContent` (Iyzipay'ın döndürdüğü iframe HTML kodu)
- `[ ]` `WIXI_ORDERS` tablosu — `WixiOrder` entity
    - `Id, CustomerId, TenantId, TotalAmount, Currency`
    - `Status` enum: `Pending / Paid / Cancelled / Refunded`
    - `IyzipayToken, ConversationId, ShippingAddress, BillingAddress`
    - `CreatedAt, UpdatedAt`
- `[ ]` `WIXI_ORDER_ITEMS` tablosu — `WixiOrderItem` entity
    - `Id, OrderId, ProductId, VariantId, ProductName, Quantity, UnitPrice`
- `[ ]` ECommerce Tenant Migration'ına bu tabloların eklenmesi
- `[ ]` `StorefrontPaymentController` — `/api/v1/storefront/payment`
    - `POST /initialize` → Iyzipay form başlatma, `checkoutFormContent` döner
    - `POST /callback` → Iyzipay callback — `CheckoutForm.Retrieve` ile token doğrula, siparişi `Paid` yap
    - `GET /orders` → Giriş yapmış müşterinin sipariş listesi
    - `GET /orders/{id}` → Sipariş detayı
- `[ ]` Sipariş sonrası stok düşürme (`WixiProductVariant.StockQuantity -= quantity`)
- `[ ]` Ödeme başarılı → müşteriye otomatik onay e-postası (mevcut Mail Servisi)
- `[ ]` `appsettings.json`'a Iyzipay yapılandırması:
    ```json
    "IyzipaySettings": {
      "ApiKey": "sandbox-...",
      "SecretKey": "sandbox-...",
      "BaseUrl": "https://sandbox-api.iyzipay.com"
    }
    ```

#### Storefront Frontend
- `[ ]` Checkout sayfasındaki mock form kaldırılıp Iyzipay iframe embed edilmesi
    - Backend'den `checkoutFormContent` alınır, `dangerouslySetInnerHTML` ile inject
- `[ ]` Ödeme sonuç sayfası — `/payment/result` (başarı / hata senaryoları)
- `[ ]` Sipariş özet sayfası — `/orders/[id]` (ödeme sonrası yönlendirme hedefi)

---

### 👤 FAZ E4: Müşteri Portalı — "Hesabım" - `[ ]`
*Dış müşteri (end-customer) kayıt → alışveriş → kendi panelinde siparişlerini takip eder.*

#### Backend
- `[ ]` `WixiCustomer` entity'sine Iyzipay'ın gerektirdiği alanların eklenmesi
    - `Phone`, `IdentityNumber` (TC kimlik), `City`, `ZipCode`
    - `DefaultShippingAddress`, `DefaultBillingAddress` (JSON alan veya ayrı tablo)
- `[ ]` `PUT /api/v1/storefront/customer/profile` — profil güncelleme
- `[ ]` `PUT /api/v1/storefront/customer/password` — şifre değiştirme
- `[ ]` `GET/POST/PUT/DELETE /api/v1/storefront/customer/addresses` — adres defteri CRUD

#### Storefront Frontend
- `[ ]` `/account` layout'u — korumalı route (token yoksa `/auth/login`)
- `[ ]` `/account/profile` — profil bilgilerini düzenleme formu
- `[ ]` `/account/addresses` — adres defteri (ekle / düzenle / sil)
- `[ ]` `/account/orders` — sipariş listesi; durum rozeti (Bekliyor / Ödendi / İptal / İade)
- `[ ]` `/account/orders/[id]` — sipariş detayı (ürünler, fatura bilgisi, kargo takip no)

---

### 📊 FAZ E5: Admin Sipariş Yönetimi - `[ ]`
*Tenant sahibinin gelen siparişleri izlediği ve yönettiği admin panel modülü.*

- `[ ]` **Backend:** `AdminOrdersController`
    - `GET /api/v1/admin/orders` — tüm siparişler (filtre: durum, tarih aralığı, müşteri adı)
    - `PATCH /api/v1/admin/orders/{id}/status` — sipariş durumu güncelleme
    - `POST /api/v1/admin/orders/{id}/refund` — iade başlatma (`CreateRefundRequest` → Iyzipay)
- `[ ]` **Frontend:** Admin paneline `Siparişler` sayfası (`ECommerceOrdersPage`)
    - Durum sekmeleri: Tümü / Bekliyor / Ödendi / İptal / İade
    - Sipariş detay modalı (ürünler, müşteri, adres, Iyzipay token)
    - Durum değiştirme ve iade butonu (SweetAlert2 onay)
- `[ ]` **Frontend:** Admin Dashboard'una sipariş özeti widget'ı
    - Bugünkü sipariş sayısı, toplam gelir, bekleyen sipariş sayısı

---

### 🔍 FAZ E6: Arama, Filtreleme ve SEO - `[ ]`
- `[ ]` **Backend:** Ürün arama: `GET /api/v1/public/products/search?q=&category=&brand=&minPrice=&maxPrice=&sort=`
- `[ ]` **Storefront:** Filtre sidebar — kategori ağacı, marka listesi, fiyat aralığı slider
- `[ ]` **Storefront:** URL'de filtre parametrelerinin korunması (shareable/bookmarkable links)
- `[ ]` **Storefront:** Ürün detay sayfasında SEO meta tags (`og:image`, `og:title`, `description`)
- `[ ]` **Storefront:** `sitemap.xml` dinamik oluşturma (Next.js Route Handler)

---

## 💱 FAZ 8: Para Birimi Yönetimi Modülü - `[x]`
*Amacımız; sistemin para birimi altyapısını kurmak: TCMB'den günlük kur çekme, parite/çapraz parite hesaplama, sistem ana dövizi konfigürasyonu.*

### Backend
- `[x]` **Entity:** `WixiCurrency` → `WIXI_CURRENCIES` (IAuditable, IsBase, IsTcmbTracked, Unit)
- `[x]` **Entity:** `WixiExchangeRate` → `WIXI_EXCHANGE_RATES` (ForexBuying/Selling, BanknoteBuying/Selling, Source, unique idx RateDate+CurrencyId)
- `[x]` **Entity:** `WixiCurrencySetting` → `WIXI_CURRENCY_SETTINGS` (BaseCurrencyCode, TcmbAutoSyncEnabled, LastSyncedAt, LastSyncStatus)
- `[x]` **Migration:** `AddCurrencyManagement` — 3 tablo + indexler
- `[x]` **Seed:** TRY (IsBase), USD, EUR, GBP + default CurrencySetting + 3 menü kaydı (Finans grubu)
- `[x]` **TCMB Servisi:** `TcmbExchangeRateService` (HttpClient, XML parse, InvariantCulture, 404→Holiday)
- `[x]` **Background Worker:** `TcmbSyncBackgroundWorker` — her gün 16:00 TR saati (Turkey timezone fix)
- `[x]` **CQRS Commands:** CreateCurrency, UpdateCurrency, DeleteCurrency, SetBaseCurrency (transaction), SyncTcmbRates (N+1 fix), UpdateCurrencySettings (validasyon)
- `[x]` **CQRS Queries:** GetCurrencies, GetExchangeRates (paged), GetLatestRates, GetParity, GetCrossParity, ConvertAmount, GetCurrencySettings
- `[x]` **Controller:** `CurrencyController` — 13 endpoint, rate limit (`currency_sync`: 5/dk)
- `[x]` **Parite Formülü:** TRY baz, Unit destekli (JPY=100), çapraz parite TRY üzerinden

### Frontend
- `[x]` **CurrencyManagementPage** — CRUD, isBase gold badge, tcmbTracking, ImageUpload, modal
- `[x]` **ExchangeRatePage** — Kur tablosu, TCMB sync butonu, Parite/Çapraz Parite/Dönüştürücü kartları
- `[x]` **CurrencySettingsPage** — Ana döviz seçimi, oto-sync switch, durum paneli
- `[x]` **Route:** `/admin/currencies`, `/admin/exchange-rates`, `/admin/currency-settings`

### Reviewer Fixleri (tamamlandı)
- `[x]` FIX-2: Rate limit `currency_sync` (5/dk) `sync-tcmb` endpoint'ine eklendi
- `[x]` FIX-3: N+1 sorgu — tüm günlük kurlar tek sorguda önceden çekildi
- `[x]` FIX-4: SetBaseCurrency race condition — fetch işlemi transaction içine taşındı
- `[x]` FIX-5: Timezone bug — `DateTime.Now` yerine Turkey Standard Time kullanıldı
- `[x]` FIX-6: BaseCurrencyCode validasyonu — existence check eklendi
- `[x]` FIX-7: LastSyncStatus truncation — kod tarafında 497 char sınırı eklendi
- `[ ]` ⚠️ FIX-1 (MANUEL): `appsettings.json` — üretim DB şifresi ve JWT secret rotate edilmeli, env variable'a taşınmalı
