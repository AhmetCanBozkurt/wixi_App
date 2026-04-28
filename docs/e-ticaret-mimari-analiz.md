# 🏗️ WIXI E-Ticaret — Mimari Karar Analizi

**Tarih:** 2026-04-28  
**Konu:** Modular Monolith vs Microservices + Next.js Storefront Stratejisi

---

## 1. Mevcut WIXI Durumu

| Katman | Teknoloji | Durum |
|--------|-----------|-------|
| Backend | ASP.NET Core 9, MediatR CQRS, EF Core, SQL Server | ✅ Çalışıyor |
| Frontend (Admin) | React 19 + Vite, Zustand, Vanilla CSS Modules | ✅ Çalışıyor |
| Auth | JWT + Refresh Token + 2FA + RBAC | ✅ Tam |
| Audit | IAuditable + WIXI_AUDIT_LOGS | ✅ Tam |
| Multi-language | WIXI_LANGUAGES + WIXI_MENU_TRANSLATIONS | ✅ Tam |
| Mailing | SMTP + Template Engine (Scriban) + Background Worker | ✅ Tam |
| File Service | WIXI_FILES (Azure/S3/Local) | ⛔ Henüz yok |
| Multi-Tenancy | Database-per-tenant izolasyon | ⛔ Henüz yok |
| Event Bus | Sadece MediatR (in-process) | ⚠️ Kısmi |

---

## 2. Microservices mi, Modular Monolith mi?

### 2.1 Karşılaştırma Tablosu

| Kriter | Modular Monolith | Microservices |
|--------|-----------------|---------------|
| **Geliştirme Hızı** | ⭐⭐⭐⭐⭐ Çok hızlı | ⭐⭐ Yavaş (altyapı kurulumu) |
| **Deploy Kolaylığı** | ⭐⭐⭐⭐ Tek artifact | ⭐⭐ Her servis ayrı pipeline |
| **Takım Büyüklüğü (1-3 kişi)** | ⭐⭐⭐⭐⭐ İdeal | ⭐ Overkill |
| **Takım Büyüklüğü (5+ kişi)** | ⭐⭐⭐ Yeterli | ⭐⭐⭐⭐⭐ İdeal |
| **Bağımsız Ölçekleme** | ⭐⭐ Tümü birlikte | ⭐⭐⭐⭐⭐ Servis bazlı |
| **Veri Tutarlılığı** | ⭐⭐⭐⭐⭐ Tek DB, transaction | ⭐⭐ Eventual consistency, Saga |
| **Debug / Hata Ayıklama** | ⭐⭐⭐⭐⭐ Kolay | ⭐⭐ Distributed tracing gerekir |
| **Operasyonel Karmaşıklık** | ⭐⭐⭐⭐⭐ Düşük | ⭐ Çok yüksek (K8s, Service Mesh) |
| **Modül İzolasyonu** | ⭐⭐⭐⭐ İyi (disiplinle) | ⭐⭐⭐⭐⭐ Doğal izolasyon |
| **Mevcut WIXI ile Uyum** | ⭐⭐⭐⭐⭐ Birebir uyumlu | ⭐⭐ Büyük refactor gerekir |

### 2.2 Microservices İçin Gerekli Altyapı (Henüz Yok)

Microservices'e geçmek istersen şu altyapıları **sıfırdan** kurman gerekir:

| Altyapı | Ne İçin | Karmaşıklık |
|---------|---------|-------------|
| **API Gateway** (Ocelot/YARP) | Tek giriş noktası, routing | Orta |
| **RabbitMQ / Kafka** | Servisler arası event bus | Yüksek |
| **Service Discovery** (Consul) | Servislerin birbirini bulması | Yüksek |
| **Distributed Tracing** (Jaeger) | Log takibi | Yüksek |
| **Docker + K8s / Docker Compose** | Her servis ayrı container | Yüksek |
| **Saga Pattern** | Dağıtık transaction yönetimi | Çok yüksek |
| **Ayrı DB'ler** | Her servisin kendi DB'si | Orta |
| **CI/CD Pipeline (x N servis)** | Her servis için ayrı build/deploy | Yüksek |

> **Toplam ek altyapı süresi: ~4-8 hafta** (hiçbir iş mantığı yazmadan)

### 2.3 Benim Önerim: **Hybrid Yaklaşım**

```
┌─────────────────────────────────────────────────────────────────┐
│                        ÖNERİLEN MİMARİ                         │
│                                                                 │
│   Şimdi: Modular Monolith (mevcut yapı + e-ticaret modülü)     │
│   ──────────────────────────────────────────────────────────    │
│   İleride: Modüller yeterince olgunlaşınca, sadece              │
│   ihtiyaç olan modül (örn: Payment) ayrı servise çıkarılır     │
│                                                                 │
│   Bu yaklaşıma "Modular Monolith First" denir ve                │
│   Shopify, Basecamp, GitHub bu şekilde başlamıştır.             │
└─────────────────────────────────────────────────────────────────┘
```

**Neden?**

1. **Takım boyutu:** 1-3 kişilik takımda microservices operasyonel yükü çok ağır
2. **WIXI zaten modüler:** `Wixi.Modules.Core` pattern'i var, `Wixi.Modules.ECommerce` eklemek 1 gün
3. **Geçiş kolay:** CQRS/MediatR + Interface soyutlamaları sayesinde bir modülü ileride servis olarak çıkarmak mümkün
4. **Veri tutarlılığı:** Sipariş → Ödeme → Stok düşme → Fatura akışında tek DB transaction çok kritik
5. **Hız:** E-ticaret iş mantığına odaklanabilirsin, altyapıyla uğraşmazsın

**Ama şu hazırlıkları şimdiden yap (ileride microservices geçişini kolaylaştırır):**

- Her modül kendi `DbContext`'ini kullansın (ayrı schema)
- Modüller arası iletişim **sadece MediatR Notifications** ile olsun (direct reference yok)
- Interface soyutlamaları `Wixi.Shared`'da tanımlansın
- Event'ler için `IDomainEvent` base class kullan

---

## 3. Next.js Storefront — Ayrı Frontend Stratejisi

### 3.1 Neden Ayrı Frontend?

| | Admin Panel (Mevcut Vite SPA) | Storefront (Yeni Next.js) |
|---|---|---|
| **Kullanıcı** | Mağaza sahibi / yönetici | Son müşteri (alışveriş yapan) |
| **SEO** | Gerekli değil (login arkası) | **KRİTİK** (Google indexleme) |
| **SSR** | Gerekli değil | **ŞART** (ilk yükleme hızı + SEO) |
| **Rendering** | CSR (Client Side) | SSR + ISR (Incremental Static) |
| **Tema** | Premium Dark Glassmorphism | Mağazaya özel, Light tema, müşteri teması |
| **Auth** | JWT + RBAC (admin) | Müşteri auth (basit session) |
| **Tasarım** | Sabit WIXI tasarım sistemi | Page Builder ile dinamik |

**Sonuç:** İki tamamen farklı kullanıcı deneyimi → **kesinlikle ayrı proje olmalı.**

### 3.2 Önerilen Proje Yapısı

```
wixi_App/
├── src/
│   ├── backend/                          # .NET API (tek backend)
│   │   ├── Wixi.API/                     # Composition root
│   │   ├── Wixi.Shared/                  # Ortak interface/entity
│   │   ├── Wixi.Modules.Core/            # Auth, Menu, Mail, Audit
│   │   └── Wixi.Modules.ECommerce/       # 🆕 E-ticaret iş mantığı
│   │
│   ├── frontend/                         # 🔵 Admin Panel (Vite + React)
│   │   └── src/                          #    Mağaza yönetimi
│   │       ├── features/ECommerce*/
│   │       └── pages/Product*, Order*
│   │
│   └── storefront/                       # 🟢 Müşteri Mağazası (Next.js)
│       ├── app/                          #    App Router (Next.js 14+)
│       │   ├── (shop)/                   #    Mağaza sayfaları
│       │   │   ├── page.tsx              #    Ana sayfa
│       │   │   ├── products/
│       │   │   │   ├── page.tsx          #    Ürün listesi
│       │   │   │   └── [slug]/page.tsx   #    Ürün detay (SSR+SEO)
│       │   │   ├── cart/page.tsx         #    Sepet
│       │   │   ├── checkout/page.tsx     #    Ödeme
│       │   │   └── account/             #    Müşteri hesabı
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/                   #    UI bileşenleri
│       │   ├── ProductCard/
│       │   ├── CartDrawer/
│       │   ├── Header/
│       │   └── Footer/
│       ├── lib/                          #    API client, utils
│       │   ├── api.ts                    #    Backend API bağlantısı
│       │   └── store.ts                  #    Zustand (sepet state)
│       ├── next.config.js
│       ├── package.json
│       └── tailwind.config.js            #    ⚡ Storefront için TW OK
```

### 3.3 Storefront'ta TailwindCSS Kullanılabilir mi?

**Evet.** Admin Panel'de TailwindCSS yasaklı çünkü premium kurumsal dark tema gerekiyor. Ama Storefront tamamen farklı bir proje — müşteriye açık, hızlı geliştirme gereken, belki Page Builder ile dinamik temalar sunan bir yapı. Burada **TailwindCSS mantıklı** çünkü:

- Hızlı prototipleme
- Responsive design kolaylığı
- Community component kütüphaneleri (Headless UI vb.)
- Tema değişkenleri CSS variables ile override edilebilir

### 3.4 Backend API Paylaşımı

```
                    ┌──────────────────────┐
                    │    Wixi.API (.NET)    │
                    │   http://localhost:5181│
                    │                      │
                    │  /api/v1/admin/*     │◄── Admin Panel (JWT + RBAC)
                    │  /api/v1/store/*     │◄── Storefront (Customer Auth)
                    │  /api/v1/public/*    │◄── Public (SEO, ürün listesi)
                    └──────────────────────┘
                         ▲           ▲
                         │           │
              ┌──────────┘           └──────────┐
              │                                  │
    ┌─────────────────┐              ┌──────────────────┐
    │  Admin Panel     │              │  Storefront       │
    │  Vite + React    │              │  Next.js (SSR)    │
    │  :5173           │              │  :3000            │
    │  Premium Dark UI │              │  Light/Dynamic UI │
    └─────────────────┘              └──────────────────┘
```

**Tek backend, üç API katmanı:**

| Route Prefix | Kimlik Doğrulama | Kullanıcı |
|---|---|---|
| `/api/v1/admin/*` | JWT + RBAC (admin rolleri) | Mağaza yöneticisi |
| `/api/v1/store/*` | Customer JWT (basit) | Alışveriş yapan müşteri |
| `/api/v1/public/*` | Yok (anonim) | Google bot, ziyaretçi |

---

## 4. Önerilen Genel Mimari (Final)

```
┌────────────────────────────────────────────────────────────────────┐
│                        WIXI PLATFORM                               │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    BACKEND (Modular Monolith)                │   │
│  │                                                             │   │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │   │
│  │  │ Wixi.Shared  │  │ Wixi.Modules     │  │ Wixi.Modules │  │   │
│  │  │ (Interface,  │  │ .Core            │  │ .ECommerce   │  │   │
│  │  │  IAuditable, │  │ (Auth, Menu,     │  │ (Product,    │  │   │
│  │  │  BaseEntity) │  │  Mail, Audit,    │  │  Order, Cart │  │   │
│  │  │              │  │  User, RBAC)     │  │  Payment,    │  │   │
│  │  │              │  │                  │  │  Shipping,   │  │   │
│  │  │              │  │                  │  │  Invoice)    │  │   │
│  │  └──────────────┘  └──────────────────┘  └──────────────┘  │   │
│  │                         │                       │           │   │
│  │                    CoreDbContext          ECommerceDbContext  │   │
│  │                         │                       │           │   │
│  │                    ┌────┴───────────────────────┴────┐      │   │
│  │                    │         SQL Server (MSSQL)       │      │   │
│  │                    │  WIXI_USERS, WIXI_PRODUCTS ...  │      │   │
│  │                    └─────────────────────────────────┘      │   │
│  │                                                             │   │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────────────────────┐  │   │
│  │  │  Redis  │  │ Hangfire │  │ MediatR (Domain Events)   │  │   │
│  │  │ (Cache) │  │ (Jobs)   │  │ OrderCreated→StockReserve │  │   │
│  │  └─────────┘  └──────────┘  │ PaymentDone→CreateInvoice │  │   │
│  │                              └───────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                     │
│              ┌───────────────┼───────────────┐                     │
│              ▼               ▼               ▼                     │
│  ┌────────────────┐ ┌──────────────┐ ┌───────────────┐            │
│  │ Admin Panel    │ │ Storefront   │ │ Mobile App    │            │
│  │ React + Vite   │ │ Next.js SSR  │ │ (Gelecek)     │            │
│  │ :5173          │ │ :3000        │ │               │            │
│  │ Dark Premium   │ │ Light/Custom │ │               │            │
│  └────────────────┘ └──────────────┘ └───────────────┘            │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Fazlama (Roadmap)

### FAZ E0: Altyapı Hazırlığı (~1-2 hafta)
- [ ] `Wixi.Modules.ECommerce` class library oluştur
- [ ] **Tenant DB Resolver Middleware** — gelen istekteki tenant bilgisine göre doğru DB'ye yönlendirme
- [ ] **Tenant Registration API** — yeni mağaza açıldığında otomatik DB oluşturma + migration
- [ ] `ECommerceDbContext` (tenant DB'sine bağlanan dinamik context)
- [ ] `IDomainEvent` + MediatR Notification altyapısı
- [ ] API route prefix'lerini ayır (`admin/`, `store/`, `public/`)
- [ ] File Service (WIXI_FILES) — ürün görselleri için şart

### FAZ E1: Ürün Kataloğu (~2 hafta)
- [ ] Product, Variant, Category, Brand entity + CRUD
- [ ] Admin Panel: Ürün Yönetim + Kategori Sayfaları
- [ ] Public API: Ürün listeleme + filtreleme

### FAZ E2: Storefront Başlangıç (~2 hafta)
- [ ] `src/storefront/` Next.js projesi oluştur
- [ ] Ana sayfa + Ürün listesi + Ürün detay (SSR)
- [ ] SEO: meta tags, JSON-LD, sitemap
- [ ] Backend public API'ye bağlantı

### FAZ E3: Sepet + Sipariş (~2 hafta)
- [ ] Cart (Redis-backed) + Checkout akışı
- [ ] Order state machine + domain events
- [ ] Customer auth (ayrı, basit JWT)
- [ ] Admin Panel: Sipariş Yönetimi

### FAZ E4: Ödeme + Kargo + Fatura (~3 hafta)
- [ ] IPaymentProvider → Iyzico adapter
- [ ] IShippingProvider → Yurtiçi Kargo adapter
- [ ] IInvoiceProvider → UBL XML + entegratör
- [ ] Hangfire: retry, timeout, fatura kuyruğu

### FAZ E5: Page Builder + Tema (~3 hafta)
- [ ] JSON schema ile sayfa yapısı
- [ ] Drag & drop builder (Admin Panel)
- [ ] Storefront'ta dinamik render
- [ ] Tenant bazlı tema desteği

---

## 6. Kritik Kararlar (Cevap Bekleniyor)

| # | Soru | Karar |
|---|------|-------|
| 1 | Multi-tenancy stratejisi? | ✅ **Database-per-tenant** |
| 2 | Storefront için TailwindCSS kullanılsın mı? | ✅ **Evet**, Admin'den bağımsız proje |
| 3 | İlk ödeme entegrasyonu? | ✅ **Iyzico** |
| 4 | İlk kargo entegrasyonu? | ✅ **Yurtiçi Kargo** |
| 5 | Hangi fazdan başlayalım? | ✅ **E0 (altyapı)** |
| 6 | Storefront'u ne zaman başlatalım? | ✅ **E1 bittikten sonra (E2'de)** |

---

## 7. Sonuç

**Modular Monolith + Ayrı Next.js Storefront** kombinasyonu bu proje için en doğru tercih:

- Backend'de tek codebase, kolay debug, tek deploy
- Modüller interface ile izole → ileride microservice'e çıkarılabilir
- Admin Panel ve Storefront tamamen bağımsız frontend'ler
- Storefront SEO/SSR avantajı Next.js ile sağlanır
- Gereksiz altyapı karmaşıklığından kaçınılır
