# Landing Page CMS & Çok Dilli Destek — Ürün Gereksinimler Dokümanı (PRD)

**Versiyon:** 1.0  
**Tarih:** 2026-05-25  
**Durum:** Taslak  
**Kapsam:** `src/frontend/src/pages/storefront/` + `Wixi.Modules.Content` (yeni modül)

---

## 1. Problem Tanımı

Landing page şu an **%95 hardcoded** — 12 sayfada 120+ veri parçası doğrudan TSX dosyalarında statik olarak tanımlı. Yalnızca `PricingSection` → `GET /Module/public` endpoint'ini kullanıyor; geri kalan her şey deploy gerektiriyor.

### Temel Sorunlar

| Sorun | Etki |
|-------|------|
| İçerik değişikliği → kod değişikliği → deploy | Pazarlama/içerik ekibi bağımsız çalışamıyor |
| Sadece Türkçe metin hardcoded | Yabancı yatırımcı / uluslararası kullanıcıya ulaşılamıyor |
| Platform istatistikleri (1.250+ mağaza) sahte | Güven kaybı; gerçek DB değerinden beslenmiyor |
| Vaka çalışmaları, takım, yol haritası — tümü fake data | Büyüyen ekip, gerçek müşteri referansları sisteme girilemiyor |
| Yol haritası oylamaları local `useState` — persist yok | Her page refresh'te sıfırlanıyor |
| İletişim formu submit → hiçbir şey kayıt edilmiyor | Lead kaybı |

---

## 2. Hedefler

1. **CMS Katmanı:** Tüm landing içerikleri admin panelden yönetilebilir olacak
2. **i18n:** Türkçe + İngilizce zorunlu başlangıç; mimari N dili destekleyecek
3. **Gerçek Zamanlı İstatistikler:** Platform sayaçları DB'den otomatik hesaplanacak
4. **Lead Capture:** İletişim formu + yol haritası oylama kaydedilecek
5. **Mevcut Mimari'ye Uyum:** `WIXI_LANGUAGES` / `*_TRANSLATIONS` pattern; `Accept-Language` header; `Wixi.Modules.*` yapısı

---

## 3. Kapsam Dışı

- Admin panel'in kendi i18n'i (bu PRD yalnızca landing page'i kapsar)
- E-ticaret storefront'un ürün sayfaları i18n'i (ayrı PRD)
- Otomatik makine çevirisi / AI çeviri (manuel çeviri yeterli v1'de)
- CDN / edge caching (infrastructure concern, ayrı ele alınacak)

---

## 4. Kullanıcı Hikayeleri

| # | Kullanıcı | Eylem | Sonuç |
|---|-----------|-------|-------|
| U1 | İçerik editörü | Yeni vaka çalışması eklemek | Admin panelde form doldurup kaydet → landing'de anında görünür |
| U2 | İçerik editörü | FAQ Türkçe güncelle, İngilizce de gir | İki dil aynı formda yan yana yönetilir |
| U3 | Pazarlama | Fiyat planını değiştir | Kod dokunmadan fiyat güncellenir |
| U4 | Ziyaretçi (EN) | Siteye girer, tarayıcı dili İngilizce | `Accept-Language: en` → tüm metinler İngilizce döner |
| U5 | Potansiyel müşteri | İletişim formu gönderir | Veritabanına kaydedilir, admin bildirim alır |
| U6 | Ziyaretçi | Yol haritasında özellik oylar | Oy DB'ye yazılır; sayfa refresh'te korunur |
| U7 | Admin | Platform istatistiklerini günceller | Gerçek tenant count otomatik; manuel alanlar (memnuniyet puanı) düzenlenebilir |

---

## 5. Veritabanı Şeması

> Tüm tablolar `Wixi.Modules.Content` modülünün `ContentDbContext`'ine aittir.  
> Mevcut `WIXI_LANGUAGES` tablosu referans alınır — yeni tablo açılmaz.

### 5.1 — İçerik Sayfaları & Genel Metinler

```sql
-- Sayfa bazlı hero, meta, SEO alanları
WIXI_LANDING_PAGES
  Id              UNIQUEIDENTIFIER PK
  Slug            NVARCHAR(100)    NOT NULL UNIQUE   -- 'home', 'features', 'pricing', 'about', 'faq', 'how-it-works', 'modules', 'contact', 'studio', 'cases', 'roadmap', 'privacy', 'kvkk'
  IsActive        BIT              DEFAULT 1
  UpdatedAt       DATETIME2

WIXI_LANDING_PAGE_TRANSLATIONS
  Id              UNIQUEIDENTIFIER PK
  PageId          FK → WIXI_LANDING_PAGES
  LanguageId      FK → WIXI_LANGUAGES
  MetaTitle       NVARCHAR(200)
  MetaDesc        NVARCHAR(500)
  HeroTitle       NVARCHAR(500)    -- HTML/markdown destekli (grad-text span'leri için)
  HeroSubtitle    NVARCHAR(1000)
  HeroBadgeText   NVARCHAR(200)
  CtaPrimary      NVARCHAR(100)
  CtaSecondary    NVARCHAR(100)
```

### 5.2 — Platform İstatistikleri

```sql
-- Hero, vaka çalışmaları, ana sayfa'da tekrar eden sayaçlar
WIXI_PLATFORM_STATS
  Id            UNIQUEIDENTIFIER PK
  StatKey       NVARCHAR(100)   UNIQUE   -- 'active_tenants', 'total_transactions', 'uptime_percent', 'avg_growth', 'satisfaction'
  DisplayValue  NVARCHAR(50)             -- '1.250+', '%287', '4.9★' — manuel override
  AutoCompute   BIT                      -- true → gerçek DB'den COUNT alınır
  ComputeQuery  NVARCHAR(500)   NULL     -- AutoCompute=true ise SQL/LINQ expression key'i
  SortOrder     INT
  IsActive      BIT

WIXI_PLATFORM_STAT_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  StatId        FK → WIXI_PLATFORM_STATS
  LanguageId    FK → WIXI_LANGUAGES
  Label         NVARCHAR(100)            -- 'Aktif İşletme' / 'Active Businesses'
```

### 5.3 — Özellikler & Modüller

> `WIXI_MODULES` zaten var; eksik alanlar eklenir. Yeni tablo gerekmez.

```sql
-- Mevcut WIXI_MODULES tablosuna eklenecek sütunlar:
ALTER TABLE WIXI_MODULES ADD
  TagLine       NVARCHAR(200)  NULL,  -- 'Çok kanallı satış, tek panel'
  ColorAccent   NVARCHAR(20)   NULL,  -- zaten var, güncellenir
  IsPublic      BIT            DEFAULT 1,
  IsPopular     BIT            DEFAULT 0,
  SortOrder     INT            DEFAULT 0

-- Mevcut veya yeni çeviri tablosu:
WIXI_MODULE_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  ModuleId      FK → WIXI_MODULES
  LanguageId    FK → WIXI_LANGUAGES
  Name          NVARCHAR(100)
  Description   NVARCHAR(1000)
  TagLine       NVARCHAR(200)
  FeaturesJson  NVARCHAR(MAX)   -- ["Çok dilli", "Stok senkron", ...]
```

### 5.4 — Fiyatlandırma Planları

```sql
WIXI_SUBSCRIPTION_PLANS
  Id              UNIQUEIDENTIFIER PK
  Slug            NVARCHAR(50)  UNIQUE  -- 'standard', 'premium', 'enterprise'
  PriceMonthly    DECIMAL(10,2)
  PriceYearly     DECIMAL(10,2)
  IsPopular       BIT
  SortOrder       INT
  IsActive        BIT
  ExternalPlanId  NVARCHAR(100) NULL   -- Stripe price ID (gelecek entegrasyon)

WIXI_SUBSCRIPTION_PLAN_TRANSLATIONS
  Id              UNIQUEIDENTIFIER PK
  PlanId          FK → WIXI_SUBSCRIPTION_PLANS
  LanguageId      FK → WIXI_LANGUAGES
  Name            NVARCHAR(100)   -- 'Standart' / 'Standard'
  Description     NVARCHAR(500)
  CtaText         NVARCHAR(100)   -- 'Hemen Başla' / 'Get Started'

WIXI_SUBSCRIPTION_PLAN_FEATURES
  Id              UNIQUEIDENTIFIER PK
  PlanId          FK → WIXI_SUBSCRIPTION_PLANS
  LanguageId      FK → WIXI_LANGUAGES
  FeatureText     NVARCHAR(300)
  IsHighlighted   BIT   -- bold olarak gösterilecek
  SortOrder       INT
```

### 5.5 — SSS / FAQ

```sql
WIXI_FAQ_CATEGORIES
  Id            UNIQUEIDENTIFIER PK
  Slug          NVARCHAR(50) UNIQUE   -- 'genel', 'fiyatlandirma', 'teknik', 'guvenlik', 'entegrasyon'
  SortOrder     INT
  IsActive      BIT

WIXI_FAQ_CATEGORY_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  CategoryId    FK → WIXI_FAQ_CATEGORIES
  LanguageId    FK → WIXI_LANGUAGES
  Label         NVARCHAR(100)

WIXI_FAQS
  Id            UNIQUEIDENTIFIER PK
  CategoryId    FK → WIXI_FAQ_CATEGORIES
  SortOrder     INT
  IsActive      BIT

WIXI_FAQ_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  FaqId         FK → WIXI_FAQS
  LanguageId    FK → WIXI_LANGUAGES
  Question      NVARCHAR(500)
  Answer        NVARCHAR(MAX)
```

### 5.6 — Vaka Çalışmaları & Referanslar

```sql
WIXI_CASE_STUDIES
  Id              UNIQUEIDENTIFIER PK
  ClientSlug      NVARCHAR(50)        -- URL için: 'kuzey-kahve'
  ClientInitials  NVARCHAR(5)         -- 'KK'
  ClientLogoUrl   NVARCHAR(500) NULL
  Industry        NVARCHAR(50)        -- 'food', 'retail', 'textile', 'service', 'manufacture'
  Metric1Value    NVARCHAR(20)        -- '%108'
  Metric2Value    NVARCHAR(20)        -- '₺248K'
  IsFeatured      BIT
  SortOrder       INT
  IsActive        BIT

WIXI_CASE_STUDY_TRANSLATIONS
  Id              UNIQUEIDENTIFIER PK
  CaseStudyId     FK → WIXI_CASE_STUDIES
  LanguageId      FK → WIXI_LANGUAGES
  ClientName      NVARCHAR(100)
  Title           NVARCHAR(300)
  Description     NVARCHAR(1000)
  FullStory       NVARCHAR(MAX) NULL  -- detay sayfası için (ileride)
  Metric1Label    NVARCHAR(100)
  Metric2Label    NVARCHAR(100)
  QuoteText       NVARCHAR(500) NULL  -- öne çıkan kart alıntısı
  QuoteAuthor     NVARCHAR(100) NULL

WIXI_TESTIMONIALS
  Id              UNIQUEIDENTIFIER PK
  AuthorName      NVARCHAR(100)
  AuthorTitle     NVARCHAR(100)
  CompanyName     NVARCHAR(100)
  AvatarUrl       NVARCHAR(500) NULL
  Rating          TINYINT         -- 1-5
  IsActive        BIT
  SortOrder       INT

WIXI_TESTIMONIAL_TRANSLATIONS
  Id              UNIQUEIDENTIFIER PK
  TestimonialId   FK → WIXI_TESTIMONIALS
  LanguageId      FK → WIXI_LANGUAGES
  QuoteText       NVARCHAR(1000)
```

### 5.7 — Hakkımızda

```sql
WIXI_TEAM_MEMBERS
  Id            UNIQUEIDENTIFIER PK
  FullName      NVARCHAR(100)
  Initials      NVARCHAR(5)
  AvatarUrl     NVARCHAR(500) NULL
  AvatarColor   NVARCHAR(20)          -- '#6366f1'
  SortOrder     INT
  IsActive      BIT

WIXI_TEAM_MEMBER_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  MemberId      FK → WIXI_TEAM_MEMBERS
  LanguageId    FK → WIXI_LANGUAGES
  Role          NVARCHAR(100)         -- 'Kurucu & CEO' / 'Founder & CEO'
  Department    NVARCHAR(100)         -- 'Yönetim' / 'Management'

WIXI_COMPANY_MILESTONES
  Id            UNIQUEIDENTIFIER PK
  Year          SMALLINT
  SortOrder     INT

WIXI_COMPANY_MILESTONE_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  MilestoneId   FK → WIXI_COMPANY_MILESTONES
  LanguageId    FK → WIXI_LANGUAGES
  Title         NVARCHAR(200)
  Description   NVARCHAR(500) NULL
```

### 5.8 — Yol Haritası

```sql
WIXI_ROADMAP_ITEMS
  Id            UNIQUEIDENTIFIER PK
  Phase         NVARCHAR(20)    -- 'shipped', 'now', 'next', 'later'
  Status        NVARCHAR(20)    -- 'Q4 2025', 'Q1 2026', ...
  Category      NVARCHAR(50)    -- 'Yeni Modül', 'Platform', 'AI', ...
  PlannedDate   NVARCHAR(50)    -- 'Mayıs 2026', 'Q3 2026'
  VoteCount     INT   DEFAULT 0
  IsShipped     BIT   DEFAULT 0
  SortOrder     INT

WIXI_ROADMAP_ITEM_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  ItemId        FK → WIXI_ROADMAP_ITEMS
  LanguageId    FK → WIXI_LANGUAGES
  Title         NVARCHAR(200)
  Description   NVARCHAR(500)

WIXI_ROADMAP_VOTES
  Id            UNIQUEIDENTIFIER PK
  ItemId        FK → WIXI_ROADMAP_ITEMS
  SessionToken  NVARCHAR(100)   -- anonymous vote (HMAC fingerprint)
  UserAgent     NVARCHAR(500)
  IpHash        NVARCHAR(100)   -- SHA256 of IP (privacy)
  VotedAt       DATETIME2
  UNIQUE (ItemId, SessionToken)

WIXI_CHANGELOG_ENTRIES
  Id            UNIQUEIDENTIFIER PK
  Version       NVARCHAR(20)    -- 'v2.8.0'
  ReleaseDate   DATE
  Tag           NVARCHAR(20)    -- 'feature', 'improvement', 'fix'
  SortOrder     INT

WIXI_CHANGELOG_TRANSLATIONS
  Id            UNIQUEIDENTIFIER PK
  EntryId       FK → WIXI_CHANGELOG_ENTRIES
  LanguageId    FK → WIXI_LANGUAGES
  Title         NVARCHAR(200)
  Description   NVARCHAR(1000)
```

### 5.9 — İletişim & Lead Capture

```sql
WIXI_CONTACT_SUBMISSIONS
  Id            UNIQUEIDENTIFIER PK
  FullName      NVARCHAR(100)
  Email         NVARCHAR(200)
  Phone         NVARCHAR(30)  NULL
  Topic         NVARCHAR(50)          -- 'Genel', 'Satış', 'Destek', 'Basın'
  Message       NVARCHAR(2000)
  Source        NVARCHAR(50)          -- 'landing-contact', 'demo-request'
  SubmittedAt   DATETIME2
  IsRead        BIT DEFAULT 0

WIXI_COMPANY_SETTINGS
  Id            UNIQUEIDENTIFIER PK
  SettingKey    NVARCHAR(100) UNIQUE   -- 'contact_email', 'contact_phone', 'office_address', 'trial_days'
  SettingValue  NVARCHAR(1000)
  IsPublic      BIT    -- true → public API'den dönebilir
```

### 5.10 — i18n: Statik UI Metinleri

> Mevcut `architecture/multi-language.md` planındaki `WIXI_RESOURCES` tablosunun landing page genişletmesi.

```sql
-- Zaten var ya da eklenecek:
WIXI_RESOURCES
  Id            UNIQUEIDENTIFIER PK
  ResourceKey   NVARCHAR(200) UNIQUE  -- 'LANDING_NAV_FEATURES', 'LANDING_CTA_START', ...
  LanguageId    FK → WIXI_LANGUAGES
  Value         NVARCHAR(MAX)
  Category      NVARCHAR(50)          -- 'landing', 'admin', 'storefront'
```

**Landing'e özgü resource key'leri (tamamlanmış liste):**

| Key | TR | EN |
|-----|----|----|
| `LANDING_NAV_FEATURES` | Özellikler | Features |
| `LANDING_NAV_PRICING` | Fiyatlandırma | Pricing |
| `LANDING_NAV_HOW_IT_WORKS` | Nasıl Çalışır? | How It Works |
| `LANDING_NAV_FAQ` | SSS | FAQ |
| `LANDING_NAV_LOGIN` | Giriş Yap | Log In |
| `LANDING_NAV_START` | Hemen Başla | Get Started |
| `LANDING_CTA_FREE_TRIAL` | 14 gün ücretsiz deneyin | Start your 14-day free trial |
| `LANDING_CTA_NO_CC` | Kredi kartı gerekmez | No credit card required |
| `LANDING_STATS_BAND_*` | (her stat label) | — |
| `LANDING_FOOTER_*` | (footer linkleri) | — |

---

## 6. Backend API Gereksinimleri

> Tüm public endpoint'ler auth gerektirmez. Admin endpoint'leri `[Authorize(Roles = "Admin")]` ile korunur.  
> Controller konumu: `Wixi.API/Controllers/Content/`  
> Modül konumu: `src/backend/Wixi.Modules.Content/`

### 6.1 — Public Endpoint'ler

```
GET  /api/v1/content/landing/{slug}           → Sayfa hero + meta (dil bazlı)
GET  /api/v1/content/stats                    → Platform istatistikleri
GET  /api/v1/content/modules/public           → Tüm aktif modüller (mevcut var; i18n eklenecek)
GET  /api/v1/content/plans/public             → Abonelik planları + features
GET  /api/v1/content/faq/public               → Kategorili FAQ listesi
GET  /api/v1/content/faq/public/{categorySlug}
GET  /api/v1/content/cases/public             → Vaka çalışmaları (filtre: industry)
GET  /api/v1/content/testimonials/public
GET  /api/v1/content/about/public             → Takım + milestone
GET  /api/v1/content/roadmap/public           → Kanban kolonları + vote count
GET  /api/v1/content/changelog/public
GET  /api/v1/content/settings/public          → IsPublic=true company settings
GET  /api/v1/content/i18n/{lang}              → WIXI_RESOURCES (category=landing)

POST /api/v1/content/contact                  → İletişim formu submit (rate limited: 5/saat/IP)
POST /api/v1/content/roadmap/{id}/vote        → Yol haritası oylama
```

### 6.2 — Admin Endpoint'ler (CRUD)

```
/api/v1/admin/content/landing-pages
/api/v1/admin/content/stats
/api/v1/admin/content/plans
/api/v1/admin/content/faq/categories
/api/v1/admin/content/faq
/api/v1/admin/content/cases
/api/v1/admin/content/testimonials
/api/v1/admin/content/team
/api/v1/admin/content/milestones
/api/v1/admin/content/roadmap
/api/v1/admin/content/changelog
/api/v1/admin/content/contact-submissions     → GET + PATCH (IsRead)
/api/v1/admin/content/company-settings
/api/v1/admin/content/i18n/resources          → WIXI_RESOURCES CRUD
```

### 6.3 — Response Formatı (örnek: FAQ)

```json
GET /api/v1/content/faq/public
Accept-Language: en

{
  "categories": [
    {
      "slug": "general",
      "label": "General",
      "items": [
        {
          "id": "...",
          "question": "What is Wixi?",
          "answer": "Wixi is a modular SaaS platform..."
        }
      ]
    }
  ]
}
```

**Dil seçimi kuralı:** Backend `Accept-Language` header'ı okur → o dil yoksa `IsDefault=true` dile fallback → hâlâ yoksa ham veri döner.

### 6.4 — Performans: Caching

- Public content endpoint'leri `IMemoryCache` ile cache'lenir: **TTL 5 dakika**
- Cache key: `content:{endpoint}:{lang}` (örn: `content:faq:tr-TR`)
- Admin herhangi bir içerik güncellediğinde ilgili cache key'leri invalidate edilir
- `WIXI_PLATFORM_STATS` `AutoCompute=true` olanlar ayrı background job ile her 10 dakikada güncellenir

---

## 7. Frontend i18n Mimarisi

### 7.1 — Kütüphane: i18next + react-i18next

```bash
npm install i18next react-i18next i18next-http-backend
```

### 7.2 — Başlatma (`src/frontend/src/app/i18n.ts`)

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('landing-lng') ?? 'tr',
    fallbackLng: 'tr',
    ns: ['landing'],
    defaultNS: 'landing',
    backend: {
      loadPath: '/api/v1/content/i18n/{{lng}}',
    },
    interpolation: { escapeValue: false },
  });
```

### 7.3 — Dil Değiştirici (LandingHeader'a eklenir)

```tsx
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  return (
    <div className={s.langSwitcher}>
      {['tr', 'en'].map((lng) => (
        <button
          key={lng}
          className={lng === i18n.language ? s.active : ''}
          onClick={() => {
            i18n.changeLanguage(lng);
            localStorage.setItem('landing-lng', lng);
          }}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
```

### 7.4 — Sayfa Bileşeni Geçiş Örneği

**Önce (hardcoded):**
```tsx
const FAQS = [
  { q: 'Wixi nedir?', a: 'Modüler bir SaaS...' },
];
```

**Sonra (API + i18n):**
```tsx
export function SssPage() {
  const { t } = useTranslation('landing');
  const { data } = useLandingFaqQuery(); // react-query

  return (
    <LandingLayout>
      <h1>{t('LANDING_FAQ_TITLE')}</h1>
      {data?.categories.map((cat) => (
        <FaqCategory key={cat.slug} category={cat} />
      ))}
    </LandingLayout>
  );
}
```

### 7.5 — API Servis Katmanı (`src/frontend/src/entities/landing/`)

```
entities/landing/
├── api/
│   ├── landingFaqQuery.ts
│   ├── landingPlansQuery.ts
│   ├── landingCasesQuery.ts
│   ├── landingRoadmapQuery.ts
│   ├── landingStatsQuery.ts
│   ├── landingAboutQuery.ts
│   └── submitContactMutation.ts
├── model/
│   └── types.ts          ← IFaq, IPlan, ICaseStudy, IRoadmapItem, ...
└── index.ts
```

Tüm query'ler `react-query` (`@tanstack/react-query`) kullanır; **staleTime: 5 dakika** (backend cache ile uyumlu).

---

## 8. Admin Panel — CMS Ekranları

> Tüm ekranlar `src/frontend/src/pages/admin/` altında `ContentManagement/` klasörüne eklenir.

### 8.1 — Ekran Listesi

| Ekran | Route | Açıklama |
|-------|-------|---------|
| FAQ Yönetimi | `/admin/content/faq` | Kategori + soru/cevap CRUD, dil sekmeli form |
| Fiyat Planları | `/admin/content/plans` | Plan + feature listesi CRUD |
| Vaka Çalışmaları | `/admin/content/cases` | Kart CRUD + öne çıkan toggle |
| Takım Üyeleri | `/admin/content/team` | Drag-drop sort, TR/EN form |
| Yol Haritası | `/admin/content/roadmap` | Kanban düzenleme, shipped/now/next/later |
| İletişim Gelen Kutusu | `/admin/content/contacts` | Submission listesi, okundu işaretle |
| Platform İstatistikleri | `/admin/content/stats` | DisplayValue override, AutoCompute toggle |
| Şirket Ayarları | `/admin/content/settings` | Key-value tablosu (telefon, adres vb.) |
| Çeviri Editörü | `/admin/content/i18n` | Resource key tablosu, TR/EN yan yana |
| Sayfa Hero'ları | `/admin/content/pages` | Her sayfa slug için TR/EN hero text |

### 8.2 — Dil Sekmeli Form Kalıbı

Her CMS formunda dil sekmeleri zorunludur:

```tsx
<Modal ...>
  <div className={s.langTabs}>
    <button className={activeLang === 'tr' ? s.tabActive : ''} onClick={() => setActiveLang('tr')}>🇹🇷 Türkçe</button>
    <button className={activeLang === 'en' ? s.tabActive : ''} onClick={() => setActiveLang('en')}>🇬🇧 English</button>
  </div>
  {activeLang === 'tr' && <Input label="Soru (TR)" value={form.question_tr} onChange={...} />}
  {activeLang === 'en' && <Input label="Question (EN)" value={form.question_en} onChange={...} />}
</Modal>
```

---

## 9. Özel Dikkat Gerektiren Senaryolar

### 9.1 — Platform İstatistikleri: Gerçek Sayaç

`AutoCompute=true` olan stat'lar için bir background service:

```csharp
// Wixi.Modules.Content/Infrastructure/Services/StatsComputeJob.cs
// IHostedService, her 10 dakikada bir çalışır
// - active_tenants → SELECT COUNT(*) FROM WIXI_TENANTS WHERE IsActive=1
// - Computed değer WIXI_PLATFORM_STATS.DisplayValue'yu override eder
```

### 9.2 — Yol Haritası Oylama: Anti-Spam

```
POST /api/v1/content/roadmap/{id}/vote
Body: { sessionToken: "hmac_fingerprint" }

Rate limit: 1 oy / item / session
IP bazlı: 10 oy / gün / IP
SessionToken: SHA256(IP + User-Agent + salt) — WIXI_ROADMAP_VOTES.SessionToken UNIQUE constraint
```

### 9.3 — İletişim Formu: Mevcut Mail Altyapısı

`WIXI_CONTACT_SUBMISSIONS` kayıt sonrası mevcut `IMailQueue` üzerinden:
- Admin'e bildirim maili (`CONTACT_NOTIFY_ADMIN` template kodu)
- Kullanıcıya otomatik yanıt (`CONTACT_AUTO_REPLY` template kodu)

Şablonlar `WIXI_MAIL_TEMPLATES`'e eklenir (mailing PRD'si ile uyumlu).

### 9.4 — Legal Sayfalar (Gizlilik / KVKK)

Legal sayfalar için özel `WIXI_LEGAL_DOCUMENTS` tablosu açılır — sürümlü (versioned) içerik gerektirir:

```sql
WIXI_LEGAL_DOCUMENTS
  Id              UNIQUEIDENTIFIER PK
  Slug            NVARCHAR(50)  -- 'privacy', 'kvkk', 'terms', 'cookies'
  Version         NVARCHAR(10)  -- '3.2'
  EffectiveDate   DATE
  IsActive        BIT

WIXI_LEGAL_DOCUMENT_TRANSLATIONS
  Id              UNIQUEIDENTIFIER PK
  DocumentId      FK → WIXI_LEGAL_DOCUMENTS
  LanguageId      FK → WIXI_LANGUAGES
  Title           NVARCHAR(200)
  ContentHtml     NVARCHAR(MAX)   -- rich HTML içerik
  LastUpdatedAt   DATETIME2
```

---

## 10. Sprint Planı

### Sprint 2 (2026-06-01 bitiş) — Temel Bağlantılar

**Hedef:** Mevcut API'ye bağlanmayan sayfaları bağla; temel altyapıyı kur.

| Görev | Tür | Süre |
|-------|-----|------|
| `Wixi.Modules.Content` projesi oluştur, DI kaydı | Backend | 0.5 gün |
| `ContentDbContext` + ilk migration (Stats, FAQ, Plans tabloları) | Backend | 1 gün |
| `GET /content/stats` endpoint | Backend | 0.5 gün |
| `GET /content/plans/public` + `GET /content/faq/public` | Backend | 1 gün |
| `POST /content/contact` + `WIXI_CONTACT_SUBMISSIONS` | Backend | 0.5 gün |
| `ModullerPage` → mevcut `/Module/public` API bağlantısı | Frontend | 0.5 gün |
| `FiyatlandirmaPage` → yeni `/content/plans/public` bağlantısı | Frontend | 0.5 gün |
| `SssPage` → `/content/faq/public` bağlantısı | Frontend | 0.5 gün |
| `IletisimPage` form submit → `/content/contact` | Frontend | 0.5 gün |
| i18next kurulumu + LanguageSwitcher (TR/EN toggle) | Frontend | 1 gün |
| Seed data: 3 plan, 18 FAQ, 5 kategori (mevcut hardcoded → DB) | Backend | 0.5 gün |

**Sprint 2 çıktısı:** Fiyatlandırma, FAQ ve İletişim sayfaları DB'den besleniyor. Dil değiştirici header'da aktif.

---

### Sprint 3 (2026-06-08 bitiş) — İçerik Yönetimi

| Görev | Tür | Süre |
|-------|-----|------|
| Vaka çalışmaları tabloları + seed + API | Backend | 1 gün |
| Takım + milestone tabloları + seed + API | Backend | 0.5 gün |
| Yol haritası tabloları + vote API + seed | Backend | 1 gün |
| `VakaCalismalariPage` API bağlantısı | Frontend | 0.5 gün |
| `HakkimizdaPage` API bağlantısı | Frontend | 0.5 gün |
| `YolHaritasiPage` API bağlantısı + kalıcı oy | Frontend | 1 gün |
| Admin: FAQ, Plan, Contact Inbox ekranları | Frontend | 2 gün |
| `WIXI_RESOURCES` landing seed (tüm nav/cta key'leri) | Backend | 0.5 gün |

---

### Sprint 4 (2026-06-15 bitiş) — Tam i18n

| Görev | Tür | Süre |
|-------|-----|------|
| Tüm sayfa bileşenlerinde `useTranslation` geçişi | Frontend | 2 gün |
| `GET /content/i18n/{lang}` endpoint | Backend | 0.5 gün |
| Changelog tabloları + seed + API bağlantısı | Backend+Frontend | 1 gün |
| Legal pages CMS tabloları + API | Backend | 1 gün |
| `GizlilikPage` / `KvkkPage` API bağlantısı | Frontend | 0.5 gün |
| Admin: Çeviri Editörü + Takım + Roadmap ekranları | Frontend | 2 gün |
| StatsComputeJob (AutoCompute tenant sayısı) | Backend | 0.5 gün |
| Platform stats API bağlantısı (tüm sayfalarda) | Frontend | 0.5 gün |

---

### Sprint 5 (2026-06-22 bitiş) — Stüdyo & Temizlik

| Görev | Tür | Süre |
|-------|-----|------|
| `StudyoPage` hero/features → landing pages API | Frontend | 0.5 gün |
| Admin: Hero/Meta yönetimi, Company Settings | Frontend | 1 gün |
| Tüm hardcoded array → silinir, test edilir | Frontend | 1 gün |
| Cache invalidation testleri | Backend | 0.5 gün |
| E2E: her sayfa TR + EN dil testi | QA | 1 gün |

---

## 11. Teknik Kısıtlar & Kurallar

1. **Modül bağımsızlığı:** `Wixi.Modules.Content` başka modüllere doğrudan referans vermez; `WIXI_MODULES` tablosuna erişim için shared interface veya MediatR query kullanılır
2. **Migration:** `dotnet ef migrations add` sadece dosya oluşturur; `database update` CI/CD ile çalışır (CLAUDE.md kuralı)
3. **Shared UI zorunluluğu:** Admin CMS ekranlarında ham input/button kullanılmaz — `Input`, `Select`, `Button`, `Modal` bileşenleri zorunludur
4. **FSD katman kuralı:** `entities/landing/` sadece GET query'leri; form/mutation `features/` katmanında
5. **CSS:** Glassmorphism + CSS Variables; TailwindCSS kullanılmaz
6. **Rate limiting:** `/content/contact` ve `/roadmap/*/vote` endpoint'leri ayrı rate limit policy'si alır
7. **SEO:** Her sayfanın `MetaTitle` + `MetaDesc` alanları `<Helmet>` ile render edilecek (react-helmet-async)

---

## 12. Açık Kararlar (Karar Bekleniyor)

| # | Konu | Seçenek A | Seçenek B |
|---|------|-----------|-----------|
| D1 | 3. dil desteği (Almanca/Arapça) | Sprint 5'te mimari hazır bırak, içerik daha sonra | Sadece TR+EN, mimari extension point yok |
| D2 | Vaka çalışması detay sayfası | Ayrı route `/vaka-calismalari/{slug}` | Modal açılır, ayrı sayfa yok |
| D3 | Stüdyo bileşen kataloğu (`COMPONENTS`) | DB'ye taşı | Hardcoded kalsın (nadiren değişir) |
| D4 | Beta üye sayısı | DB'den gerçek kayıtlı beta user sayısı | Manuel stat olarak `WIXI_PLATFORM_STATS`'ta |

---

## 13. Başarı Kriterleri

- [ ] 12 landing sayfasından hiçbirinde hardcoded Türkçe metin kalmamış
- [ ] TR ↔ EN geçişi tüm sayfalarda bozukluk olmadan çalışıyor
- [ ] Admin panelinden bir FAQ ekle → 5 dakika içinde canlı sayfada görünüyor (cache TTL)
- [ ] İletişim formu gönderimi → DB'ye kayıt + admin mail bildirimi
- [ ] Yol haritası oylaması sayfa yenileme sonrası korunuyor
- [ ] Platform istatistik sayaçları gerçek tenant sayısını yansıtıyor
- [ ] Lighthouse SEO skoru ≥ 90 (meta tag'ler API'den doluyor)
