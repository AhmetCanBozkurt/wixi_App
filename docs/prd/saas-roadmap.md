# WixiApp — SaaS Satın Alma & Tenant Yönetim Yol Haritası

> Analiz Tarihi: 2026-05-07  
> Durum: Analiz tamamlandı, Faz B (landing) geliştirme başladı

---

## Mevcut Durum (Olgunluk: ~%20)

### Çalışan
- Tenant kaydı (`POST /api/v1/saas/onboarding/register`) → tenant DB provisioning
- WixiTenant entity: Plan (string "Free/Trial"), SubscriptionExpiresAt (nullable)
- ECommerce backend controller'ları (Products, Categories, Brands) — ECommerce modülü Program.cs'de comment'li
- Landing page (MasterStorefrontPage) — temel HTML/CSS yapısı

### Kritik Eksikler
| Alan | Eksik |
|---|---|
| Ödeme | Stripe entegrasyonu yok, webhook yok |
| Abonelik | WixiSubscriptionPlan, WixiTenantSubscription entity'leri yok |
| Tenant admin | WixiUser ↔ WixiTenant bağlantısı yok (`OwnerEmail` sadece string) |
| Store dashboard | Tenant'ın kendi mağazasını yöneteceği `/store/*` sayfası yok |
| Landing | Pricing bölümü yok, SSS yok, sosyal kanıt yok |
| App routing | `/` → `/login` yönlendiriyor, landing page erişilemiyor |

---

## Mimari Karar: Tek React App, İki Route Ağacı

```
/ (public landing)
/login        → Platform admin girişi
/store-login  → Tenant mağaza sahibi girişi  [YENİ]
/admin/*      → Platform SuperAdmin paneli   [MEVCUT]
/store/*      → Tenant mağaza yönetim paneli [YENİ]
/checkout/success
/checkout/cancel
```

**Neden tek app?** `axiosConfig.ts` X-Tenant-Slug header injection'ı zaten var. JWT token'lar aynı auth altyapısını kullanır. İki ayrı Vite app gereksiz karmaşıklık yaratır.

---

## FAZ A — Subscription Backend (Öncelik: Yüksek)

### A1. Yeni Entity'ler (Master DB)

**WixiSubscriptionPlan**
```csharp
Id, Name, Code ("free"/"starter"/"pro"), PriceMonthly, PriceYearly,
FeaturesJson (JSON array), MaxProducts (-1=unlimited), MaxUsers,
StripePriceIdMonthly, StripePriceIdYearly, SortOrder, IAuditable
```

**WixiTenantSubscription**
```csharp
Id, TenantId (FK), PlanId (FK), Status (Trial/Active/Cancelled/PastDue),
CurrentPeriodStart, CurrentPeriodEnd, BillingInterval (Monthly/Yearly),
StripeCustomerId, StripeSubscriptionId, PaymentMethod
NOT IAuditable — subscription geçmişi asla soft-delete olmamalı
```

**WixiPaymentTransaction**
```csharp
Id, TenantId (FK), Amount, Currency, Status, Gateway (Stripe/Iyzipay/Manual),
ExternalId (Stripe PaymentIntent ID), FailureReason, CreatedAt
NOT IAuditable — ödeme kayıtları kalıcı tarih, global query filter dışarıda tutulmalı
```

> ⚠️ CRITICAL: `WixiPaymentTransaction` **IAuditable IMPLEMENT ETMEMELİ** — global soft-delete query filter tüm ödeme kayıtlarını sorgulardan dışlar.

### A2. WixiTenant Güncellemesi

```csharp
// Eklenecek alanlar:
Guid? OwnerUserId  // FK to WixiUsers — ÖNCE AUTH YOKTUR
string? ThemeColorPrimary
string? CustomDomain
string? BannerImageUrl
string? SeoTitle, SeoDescription
```

### A3. Stripe Entegrasyonu

- NuGet: `Stripe.net 47.*` → `Wixi.API.csproj`
- `StripeOptions` (appsettings): SecretKey, PublishableKey, WebhookSecret
- `IStripeService` interface + `StripeService` implementation
  - `CreateCheckoutSessionAsync(tenantId, planCode, billingInterval, successUrl, cancelUrl)`
  - `CreateCustomerPortalSessionAsync(stripeCustomerId, returnUrl)`
- Webhook endpoint: `POST /api/v1/webhooks/stripe`
  - ⚠️ Raw body okuma zorunlu — Stripe imza doğrulaması için MVC body buffering bypass et
  - Handles: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`

### A4. Yeni Controller'lar

```
GET  /api/v1/plans                        — [AllowAnonymous]
GET  /api/v1/plans/publishable-key        — [AllowAnonymous] Stripe public key
POST /api/v1/saas/checkout                — [Authorize] → { sessionUrl }
GET  /api/v1/saas/subscription            — [Authorize] → current subscription
POST /api/v1/saas/billing-portal          — [Authorize] → Stripe portal URL
POST /api/v1/saas/cancel-subscription     — [Authorize]
POST /api/v1/webhooks/stripe              — [AllowAnonymous]
POST /api/v1/store-admin/auth/login       — [AllowAnonymous] → JWT with tenantSlug claim
GET  /api/v1/store-admin/settings         — [RequireTenantAdmin]
PUT  /api/v1/store-admin/settings         — [RequireTenantAdmin]
GET  /api/v1/store-admin/dashboard        — [RequireTenantAdmin]
GET  /api/v1/storefront/config            — [AllowAnonymous, X-Tenant-Slug]
```

### A5. SaasOnboardingController Güncellemesi (Kritik)

Kayıt sırasında şu anda sadece `WixiTenant` oluşturuluyor. Eklenmeli:
1. `WixiUser` oluştur (`UserManager.CreateAsync`) → role: TenantAdmin
2. `tenant.OwnerUserId = newUser.Id` set et
3. `WixiTenantSubscription` oluştur: Status=Trial, PeriodEnd=+14 gün
4. Welcome email gönder (şifre kurulum linki)

### A6. Background Worker

`SubscriptionExpiryBackgroundWorker` — 6 saatte bir çalışır, süresi dolan Active abonelikleri PastDue yapar, email gönderir.

---

## FAZ B — Frontend Satın Alma Akışı (Öncelik: Yüksek)

### B1. Landing Page Modernizasyonu ✅ GELİŞTİRME BAŞLADI

Yeni bölümler: Hero (animasyonlu), StatsBar, Features, How It Works, Dashboard Preview, Pricing, FAQ, Footer

### B2. Yeni Route'lar (App.tsx)

```tsx
<Route path="/" element={<MasterStorefrontPage />} />   // ← /login yönlendirmesi KALDIRILDI
<Route path="/pricing" element={<PricingPage />} />
<Route path="/checkout/success" element={<CheckoutSuccessPage />} />
<Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
<Route path="/store-login" element={<StoreLoginPage />} />
```

### B3. Satın Alma Akışı

```
Landing → Plan Seç (Free/Starter/Pro)
  ↓
RegisterModal (store adı, slug, email)
  ↓ POST /api/v1/saas/onboarding/register
  ↓
Free plan → admin URL redirect
Ücretli plan → POST /api/v1/saas/checkout → sessionUrl → window.location = Stripe
  ↓
Stripe Checkout → başarı: /checkout/success?tenant=slug&session_id=xxx
  ↓
/checkout/success → GET /api/v1/saas/subscription → "Go to your store" → /store-login?tenant=slug
```

---

## FAZ C — Tenant Mağaza Yönetim Paneli (Öncelik: Yüksek)

Bu FAZ'ın en kritik parçası: tenant sahibinin kendi mağazasını yönettiği panel.

### C1. Store Admin Auth

JWT payload için ek claim: `tenantSlug`, `role = "TenantAdmin"`
`StoreAdminAuthController` → `POST /api/v1/store-admin/auth/login`
Login sonrası: `localStorage.setItem('wixi-active-tenant', tenantSlug)` — mevcut axiosConfig otomatik inject eder

### C2. Route Yapısı

```tsx
<Route path="/store-login" element={<StoreLoginPage />} />
<Route element={<StoreAdminGuard />}>
  <Route path="/store" element={<StoreAdminPage />}>
    <Route index element={<StoreDashboard />} />
    <Route path="products" element={<ECommerceProductsPage />} />   ← mevcut sayfaları yeniden kullan
    <Route path="categories" element={<ECommerceCategoriesPage />} />
    <Route path="brands" element={<ECommerceBrandsPage />} />
    <Route path="orders" element={<StoreOrdersPage />} />           ← placeholder (entity yok)
    <Route path="customers" element={<StoreCustomersPage />} />
    <Route path="settings" element={<StoreSettingsPage />} />
    <Route path="billing" element={<StoreBillingPage />} />
  </Route>
</Route>
```

### C3. Yeni Dosyalar

```
src/frontend/src/
  pages/
    StoreAdminPage/StoreAdminPage.tsx      — shell (sidebar+header+outlet)
    StoreLoginPage/StoreLoginPage.tsx
    StoreDashboard/StoreDashboard.tsx      — KPI cards
    StoreOrdersPage/StoreOrdersPage.tsx    — placeholder
    StoreCustomersPage/StoreCustomersPage.tsx
    StoreSettingsPage/StoreSettingsPage.tsx — tabs: Profile, Theme, SEO
    StoreBillingPage/StoreBillingPage.tsx  — plan durumu + Stripe portal
  widgets/
    StoreAdminSidebar/StoreAdminSidebar.tsx
  app/providers/
    StoreAdminGuard.tsx
    TenantAdminContext.tsx
```

### C4. ECommerce Modülü Aktivasyonu

`Program.cs`'de comment'li olan şunlar açılmalı:
```csharp
builder.Services.AddECommerceModule(builder.Configuration);
app.UseECommerceModule();
await app.MigrateAllTenantDbsAsync();
```

---

## FAZ D — Storefront Özelleştirme (Öncelik: Orta)

- Tenant: ThemeColorPrimary, ThemeColorSecondary, BannerImageUrl, CustomDomain, SeoTitle/Description
- `GET /api/v1/storefront/config` → public endpoint, tenant theme bilgisi döner
- Frontend: renk seçici, logo yükleme, SEO ayarları
- ECommerce tenant DB: `WixiEcBanner` entity (başlık, URL, resim, sıra)

---

## Migration Sırası

### Master DB (WixiCoreDbContext)
1. ✅ Mevcut — son migration: `20260507_*`
2. 🆕 `AddSubscriptionAndPayment` — 3 yeni tablo
3. 🆕 `AddTenantOwnerUserId` — nullable FK
4. 🆕 `AddTenantCustomizationFields` — theme/SEO colonlar

### Tenant DB (ECommerceDbContext)
1. ✅ Mevcut — son migration: `20260428_UpdateWixiCustomerTableName`
2. 🆕 `AddWixiEcBanners` — banner tablosu
3. 🆕 `AddWixiOrders` — (FAZ D+) sipariş entity'leri

---

## MVP → İlk Ödeme Alan Müşteri

1. **FAZ A minimal**: Subscription plan seed + tenant kayıtta WixiUser oluşturma + Stripe checkout session + `checkout.session.completed` webhook
2. **FAZ B**: Pricing section landing'de + RegisterModal → Stripe redirect + CheckoutSuccessPage
3. **FAZ C minimal**: StoreAdminAuth + StoreAdminPage shell + mevcut Products sayfasını `/store/products`'ta göster + StoreBillingPage

---

## Kritik Riskler

| Risk | Önlem |
|---|---|
| Stripe webhook raw body | `Request.EnableBuffering()` + imza doğrulama middleware |
| WixiPaymentTransaction IAuditable | Entity'i IAuditable'dan TÜRETME |
| ECommerce modülü comment'li | Program.cs'de uncomment et, migration kontrolü yap |
| WixiUser ↔ WixiTenant bağlantısı yok | SaasOnboardingController öncelikli güncellenmeli |
| `/` → `/login` redirect | App.tsx güncellenmeli (FAZ B başlangıcı) |
