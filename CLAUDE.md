# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Görev Yönetimi — ClickUp MCP Entegrasyonu

Her yeni görev, durum güncellemesi ve sprint takibi **ClickUp MCP** üzerinden yapılır. Hiçbir görev sadece konuşma içinde tutulmaz — ClickUp tek kaynak.

### Klasör & Liste Yapısı

```
📁 Wixi_App (folder_id: 901814149335)  —  Space: Wixisoftware.com (90188073741)
├── 📋 Auth & Güvenlik        list_id: 901818217836
├── 📋 Admin Panel            list_id: 901818217838
├── 📋 E-Commerce & Store     list_id: 901818217839
├── 📋 Store Admin            list_id: 901818217840
├── 📋 Multi-Tenant Core      list_id: 901818217841
├── 📋 Landing Page           list_id: 901818217842
├── 📋 API & Backend          list_id: 901818217843
└── 📋 UI & Shared Components list_id: 901818217844
```

### Yeni Görev Açarken Zorunlu Alanlar

```
name:      Türkçe, kısa ve eyleme dayalı başlık
list_id:   Modüle göre yukarıdaki tablodan seç
priority:  urgent | high | normal | low
due_date:  Haftalık sprint bitiş tarihi (Pazartesi = sprint başı, Pazartesi = bitiş)
status:    Açık görev → (varsayılan)  |  Biten → "complete"
```

### Sprint Takvimi (Haftalık)

| Sprint | Bitiş Tarihi | Kapsam |
|--------|-------------|--------|
| Sprint 1 | 2026-05-25 | urgent görevler (Iyzipay, Order, Bug fix) |
| Sprint 2 | 2026-06-01 | high — Filtreleme, Refund, CI, Exception |
| Sprint 3 | 2026-06-08 | high — Pricing UI, Customer Portal, Notes |
| Sprint 4 | 2026-06-15 | normal — SEO, Analytics, FluentValidation |
| Sprint 5 | 2026-06-22 | low — Legacy migration, Test, Bundle |

### Görev Yaşam Döngüsü Kuralları

- **Yeni iş başladığında** → `clickup_update_task` ile `status: "in progress"` yap
- **Tamamlandığında** → `status: "complete"` + gerçek bitiş tarihini `due_date` olarak güncelle
- **Kapsam genişlerse** → mevcut görevi güncelle, yeni bağımlılık varsa `clickup_add_task_dependency` kullan
- **Yeni modül/feature kararlaşırsa** → ilgili listeye hemen `clickup_create_task` ile ekle
- **Bug bulunursa** → ilgili modül listesine `priority: urgent`, `task_type: Bug` ile ekle

### MCP Araç Referansı

| İşlem | MCP Aracı |
|-------|-----------|
| Görev oluştur | `clickup_create_task` |
| Görev güncelle (status/tarih/öncelik) | `clickup_update_task` |
| Görevleri listele/filtrele | `clickup_filter_tasks` |
| Bağımlılık ekle | `clickup_add_task_dependency` |
| Yorum ekle | `clickup_create_task_comment` |
| Workspace yapısına bak | `clickup_get_workspace_hierarchy` |

---

## ⚠️ Agent Worktree Yasak

`Agent` tool çağrılarında **`isolation: "worktree"` parametresi kesinlikle kullanılmaz**. Worktree oluşturmak yasaktır — `.claude/worktrees/` dizinini kirletiyor ve gereksiz disk alanı kaplıyor.



## Merkezi Teknik Beyin

Bu projeye özgü mimari kararlar, bug çözümleri ve desenler için **Wixi Brain**'e başvur:
**`C:\PROJECTS\wixi-brain\`**

Karar vermeden veya analiz yapmadan önce kontrol et:
- `architecture/` — Modüler monolit, CQRS yapısı
- `patterns/` — MediatR cross-module event, lazy create pattern
- `decisions/` — Binance API tercihi (ADR-001)
- `bugs/` — EF Core DbUpdateConcurrencyException çözümü
- `projects/crypto-predict-ai.md` — Bu projenin kısa özeti

---


## Commands

### Frontend (`src/frontend/`)
```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run typecheck    # TypeScript type check (tsc -b)
npm run lint         # ESLint
```

### Backend (`src/backend/`)
```bash
# Run the API (http://localhost:5181)
dotnet run --project src/backend/Wixi.API/Wixi.API.csproj

# Build entire solution
dotnet build src/backend/Wixi.Platform.sln

# EF Core migrations — SADECE dosya oluştur, database update ÇALIŞTIRILMAZ
dotnet ef migrations add <MigrationName> \
  --project src/backend/Wixi.Modules.Core \
  --startup-project src/backend/Wixi.API \
  --output-dir Infrastructure/Data/Migrations

# ⚠️ `dotnet ef database update` LOCAL'DEN ÇALIŞTIRILMAZ.
# Program.cs'deki MigrateAsync() Docker container ayağa kalkınca test DB'ye otomatik uygular.
# Staging: deploy-staging.yml pipeline'ı STAGING_DB_CONNECTION ile uygular.
# Prod:    deploy-prod.yml pipeline'ı uygular.
# Local appsettings.json canlı DB'yi gösterdiğinden manuel update canlıya gider.
```

## Admin Menüsüne Yeni Madde Ekleme (SQL)

Menüler `WIXI_MENUS` + `WIXI_MENU_TRANSLATIONS` tablolarına direkt SQL ile eklenir.  
`SeedData.cs` yalnızca ilk kurulumda çalışır; mevcut DB'de SQL kullanılır.

### Bağlantı Bilgileri
```
Server : 78.188.86.124,1533
DB     : Wixi_App_TEST   ← Manuel SQL her zaman TEST DB'ye çalıştırılır
DB     : Wixi_App        ← Prod DB (CI/CD pipeline tarafından yönetilir, direkt bağlanılmaz)
User   : Wixi_App / Wixi_App12.
```

> ⚠️ **Kural:** El ile çalıştırılan tüm SQL scriptleri (menü ekleme, seed vb.) **`Wixi_App_TEST`** veritabanına uygulanır. `Wixi_App` (prod) yalnızca deploy pipeline'ı tarafından güncellenir.

### Sabit ID'ler

> ⚠️ **TEST ve PROD DB'lerinin ID'leri FARKLIDIR.** Doğru DB'ye göre doğru ID seti kullanılır.

#### TEST DB (`Wixi_App_TEST`)
```sql
-- Admin kullanıcı
DECLARE @adminId UNIQUEIDENTIFIER = 'A649A4BE-E7D6-4C70-53CD-08DEB53255B1';
-- Türkçe dil (tr-TR)
DECLARE @trId    UNIQUEIDENTIFIER = '24071C53-2B52-42B9-9FAE-FA60B65B37AA';
-- İngilizce dil (en-US)
DECLARE @enId    UNIQUEIDENTIFIER = '5AA1D063-B1CE-46BC-9772-363A650E484E';
```

#### PROD DB (`Wixi_App`) — CI/CD pipeline tarafından yönetilir
```sql
-- Admin kullanıcı
DECLARE @adminId UNIQUEIDENTIFIER = '2CEB2FC2-7818-45AE-1AE4-08DE9698C0CB';
-- Türkçe dil
DECLARE @trId    UNIQUEIDENTIFIER = 'F105229B-2D91-43C1-95B6-B344BCEC4D0F';
-- İngilizce dil
DECLARE @enId    UNIQUEIDENTIFIER = 'D2608AF2-E718-489D-A90F-A8009A1A5ED7';
```

### Şablon: Klasör + Alt Menü Ekle
```sql
-- TEST DB ID'leriyle örnek:
DECLARE @adminId UNIQUEIDENTIFIER = 'A649A4BE-E7D6-4C70-53CD-08DEB53255B1';
DECLARE @trId    UNIQUEIDENTIFIER = '24071C53-2B52-42B9-9FAE-FA60B65B37AA';
DECLARE @enId    UNIQUEIDENTIFIER = '5AA1D063-B1CE-46BC-9772-363A650E484E';
DECLARE @now     DATETIME2        = GETUTCDATE();

-- 1. Klasör (folder)
DECLARE @fId UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@fId, @adminId, NULL, 'folder', 'FaFolder', '#6366f1', 60, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @fId, @trId, 'Klasör Adı TR', @now, 1, 0),
       (NEWID(), @fId, @enId, 'Folder Name EN', @now, 1, 0);

-- 2. Alt menü
DECLARE @mId UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@mId, @adminId, @fId, '/admin/yeni-sayfa', 'FaCircle', '#10b981', 1, 1, @now, 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @mId, @trId, 'Menü Adı TR', @now, 1, 0),
       (NEWID(), @mId, @enId, 'Menu Name EN', @now, 1, 0);
```

### Şablon: Tek Root Menü (klasörsüz)
```sql
-- ParentId = NULL → root seviyede görünür
DECLARE @mId UNIQUEIDENTIFIER = NEWID();
INSERT INTO WIXI_MENUS (Id, UserId, ParentId, Path, Icon, IconColor, SortOrder, IsVisible, CreatedAt, IsActive, IsDeleted)
VALUES (@mId, '2CEB2FC2-7818-45AE-1AE4-08DE9698C0CB', NULL, '/admin/yeni-sayfa', 'FaHome', '#3b82f6', 55, 1, GETUTCDATE(), 1, 0);

INSERT INTO WIXI_MENU_TRANSLATIONS (Id, MenuId, LanguageId, Title, CreatedAt, IsActive, IsDeleted)
VALUES (NEWID(), @mId, 'F105229B-2D91-43C1-95B6-B344BCEC4D0F', 'Türkçe Ad', GETUTCDATE(), 1, 0),
       (NEWID(), @mId, 'D2608AF2-E718-489D-A90F-A8009A1A5ED7', 'English Name', GETUTCDATE(), 1, 0);
```

### Mevcut SortOrder'u Kontrol Et
```sql
SELECT MAX(SortOrder) FROM WIXI_MENUS WHERE ParentId IS NULL;  -- root max
SELECT MAX(SortOrder) FROM WIXI_MENUS WHERE ParentId = '<folder-id>';  -- klasör içi max
```

### Kurallar
- `Path = 'folder'` → klasör (tıklanabilir değil, accordion)
- `Path = '#'` → tıklanabilir ama yönlendirme yok (placeholder)
- `Icon` değerleri `react-icons/fa` isimleri: `FaWallet`, `FaChartPie`, `FaExchangeAlt` vb.
- `SortOrder` her menü için benzersiz olmalı (root içinde ya da parent içinde)
- Her eklenen menü için **hem TR hem EN** çeviri satırı zorunlu
- Yeni özellik eklenince `SeedData.cs`'e de eklenmeli (fresh kurulum için)

### Mevcut Finans Menüsü (referans)
```
SortOrder 50 — "Finans" klasörü (FaWallet #10b981)
  ├── /my-finance              → Genel Bakış   (FaChartPie  #6366f1)
  ├── /my-finance/transactions → İşlemler      (FaExchangeAlt #8b5cf6)
  ├── /my-finance/budgets      → Bütçeler      (FaPiggyBank #f59e0b)
  └── /my-finance/categories   → Kategoriler   (FaTags #ec4899)
```

---

## Architecture

### Monorepo layout
```
src/
  backend/            # .NET 9 solution (Wixi.Platform.sln)
  frontend/           # React 19 + Vite + TypeScript
docs/TASKS.md         # Phase-based task tracker synced to Linear
```

### Backend — Clean Architecture / CQRS

#### Mevcut Modüller

| Project | Role |
|---|---|
| `Wixi.API` | ASP.NET Core Web API — controllers, `Program.cs`, Serilog, DI wiring |
| `Wixi.Modules.Core` | Core domain: Auth, Users, Roles, Menus, Languages, Mailing, Audit Logs |
| `Wixi.Modules.ECommerce` | SaaS e-commerce module (per-tenant DB) — **currently commented out** in `Program.cs` |
| `Wixi.Shared` | Shared config records (`JwtOptions`, `MailOptions`) and base interfaces (`IAuditable`) |

#### ⚠️ Hedef Modül Yapısı (Yeni kod bu yapıya göre eklenir)

```
src/backend/
├── Wixi.API/
├── Wixi.Shared/
├── Wixi.Modules.Identity/        ← Auth, UserManagement, Roles, Permissions
├── Wixi.Modules.Settings/        ← Currencies, Languages, Mailing, Navigation, Logs
├── Wixi.Modules.ReferenceData/   ← Port, Region, TaxOffice, Incoterm, PaymentTerm, PackageType, TransportMode
├── Wixi.Modules.Subscriptions/   ← Stripe, SubscriptionPlans, TenantSubscription
└── Wixi.Modules.ECommerce/       ← Catalog, Sales, Inventory, Store, Marketing
```

> Mevcut `Wixi.Modules.Core` split edilene kadar **yeni feature'lar** domain'ine göre yukarıdaki hedef modül adıyla klasörlenir (örn. Auth feature → Identity, Currency feature → Settings).

#### Zorunlu Modül İç Yapısı

Her `Wixi.Modules.*` projesi bu yapıyı takip eder:

```
Wixi.Modules.<Name>/
├── Application/
│   └── <Feature>/
│       ├── Commands/
│       │   └── <Action>/
│       │       ├── <Action>Command.cs
│       │       └── <Action>CommandHandler.cs
│       ├── Queries/
│       │   └── <Action>/
│       │       ├── <Action>Query.cs
│       │       └── <Action>QueryHandler.cs
│       └── Dto/
├── Domain/
│   └── Entities/          ← entity adları Wixi* prefix ile başlar
├── Infrastructure/
│   ├── Data/
│   │   ├── Migrations/    ← sadece bu modülün migration'ları
│   │   └── <Name>DbContext.cs
│   └── Services/
└── <Name>ModuleExtensions.cs    ← DI kaydı ve middleware buraya
```

**Kurallar:**
- Her modül kendi `*ModuleExtensions.cs` içinde `AddXxxModule()` / `UseXxxModule()` metodunu export eder
- Modüller arası iletişim doğrudan method çağrısı değil MediatR event ile olur
- `Domain/Entities/` altındaki tüm entity sınıfları `Wixi` prefix'i ile başlar (`WixiUser`, `WixiPort`, vb.)
- EF Core migration'ları her zaman modülün kendi `Infrastructure/Data/Migrations/` klasörüne yazılır

Every feature in `Wixi.Modules.Core` follows strict CQRS with MediatR:
- `Application/<Feature>/Commands/<Action>/` — `*Command.cs` + `*CommandHandler.cs`
- `Application/<Feature>/Queries/<Action>/` — `*Query.cs` + `*QueryHandler.cs`
- `Domain/Entities/` — EF Core entities prefixed with `Wixi*`
- `Infrastructure/Data/` — `WixiCoreDbContext`, `WixiCoreDbContextFactory` (design-time), migrations

#### Zorunlu Controller Klasör Yapısı

Controllers düz listede **değil**, domain alt-klasörlerine ayrılmış olmalıdır. Yeni controller eklerken mutlaka doğru alt-klasörü seç:

```
Wixi.API/Controllers/
├── Identity/        → AuthController, UserManagementController
├── Core/            → Currency, Language, Menu, Module, ModuleMenu, Mailing, Audit, SystemLog
├── ReferenceData/   → her entity için ayrı controller (Ports, Regions, TaxOffices, Incoterms...)
├── Subscriptions/   → Plans, StripeWebhook, SaasSubscription, SaasOnboarding, Tenants
├── Admin/           → AdminDashboard, AdminProducts, AdminCategories, AdminBrands, AdminTheme
├── StoreAdmin/      → StoreAdminAuth, StoreAdminMenus, StoreAdminUpload, StoreSettings, StorePages, ThemeVersions
├── Storefront/      → StorefrontAuth, StorefrontProducts, StorefrontCategories, StorefrontCart, StorefrontOrders...
└── Utility/         → Files, Schema, SeedData
```

**Kurallar:**
- **Namespace:** `Wixi.API.Controllers.<Domain>` (örn. `namespace Wixi.API.Controllers.StoreAdmin;`)
- **Route değişmez:** Klasör/namespace değişikliği `[Route(...)]` attribute'larını etkilemez, API URL'leri aynı kalır
- **God controller yasak:** Tek controller birden fazla domain entity'sini yönetemez. `ReferenceDataController` → her entity ayrı controller. `StoreAdminSettingsController` → StoreSettings + StorePages + ThemeVersions ayrı controller'lar
- **Program.cs değişikliği gerekmez:** `AddControllers()` tüm alt-klasörleri otomatik discover eder

**Auth flow:** Login → optional 2FA (OTP via email, HMAC-hashed in DB) → JWT access token + HttpOnly refresh token cookie. Token refresh is attempted once on 401 before logging out.

**Mail system:** `IMailQueue` (in-memory) → `MailingBackgroundWorker` (hosted service) → `IMailService` (MailKit) using Scriban templates stored in `WIXI_MAIL_TEMPLATES`.

**ECommerce multi-tenancy:** Each tenant gets its own database provisioned by `ECommerceTenantProvisioner`. Tenant is resolved from `X-Tenant-Slug` request header via `TenantMiddleware`. Master DB lives in `WixiCoreDbContext`; per-tenant DBs use `ECommerceDbContext`.

### Frontend — Feature-Sliced Design (FSD)

#### Katman Tanımları (Ne Nereye Gider)

| Katman | Klasör | Ne Koyulur | Ne Koyulmaz |
|--------|--------|-----------|-------------|
| App Shell | `app/` | Router, AuthGuard, global provider'lar | İş mantığı |
| Entities | `entities/` | TS interface, Zustand store, **sadece GET** API çağrıları | Form, mutation, side effect |
| Features | `features/` | Form handler, iş akışı, POST/PUT/DELETE API çağrıları, stateful UI | Saf veri modeli |
| Pages | `pages/` | Route-level bileşenler, domain alt-klasörlerine ayrılmış | Paylaşılan iş mantığı |
| Widgets | `widgets/` | Birden fazla entity/feature kullanan layout bileşenleri | İş mantığı |
| Shared UI | `shared/ui/` | Domain-agnostik UI bileşenleri | Entity import'u |

#### Zorunlu Pages Klasör Yapısı

```
src/frontend/src/pages/
├── admin/                    ← /admin/* rotaları
│   ├── DashboardPage/
│   ├── UserManagementPage/
│   ├── RoleManagementPage/
│   ├── CurrencyManagementPage/
│   ├── LanguageManagementPage/
│   ├── AuditLogPage/
│   └── ...
├── store-admin/              ← /store-admin/* rotaları
│   ├── StoreAdminPage/
│   ├── StoreProductsPage/
│   ├── StoreCariPage/
│   ├── StoreAnalyticsPage/
│   └── ...
├── ecommerce/                ← /ecommerce/* rotaları (platform admin)
│   ├── ECommerceProductsPage/
│   ├── ECommerceBrandsPage/
│   └── ECommerceTenantsPage/
├── storefront/               ← müşteri mağaza rotaları
│   ├── StorefrontPage/
│   ├── StorefrontCartPage/
│   ├── StorefrontCheckoutPage/
│   └── ...
└── auth/                     ← genel auth sayfaları
    ├── LoginPage/
    ├── ForgotPasswordPage/
    └── ResetPasswordPage/
```

> **Yeni sayfa eklerken:** Hangi domain'e ait olduğunu belirle (`admin/`, `store-admin/`, `ecommerce/`, `storefront/`, `auth/`) ve o alt-klasöre koy. Düz `pages/` köküne **kesinlikle** yeni sayfa eklenmez.

#### Zorunlu Sayfa Klasörü İç Yapısı

```
<PageName>/
├── index.ts                  ← export { default } from './<PageName>'
├── <PageName>.tsx
├── <PageName>.module.css
└── components/               ← sadece bu sayfaya özgü alt componentler
    └── <SubComponent>/
        ├── <SubComponent>.tsx
        └── <SubComponent>.module.css
```

#### ThemeEditor → features/ThemeBuilder/ (Hedef)

ThemeEditor şu an `StoreAdminPage/pages/ThemeEditor/` içinde gömülü. Yeni geliştirme yapılırken veya taşındığında hedef konum:

```
src/frontend/src/features/ThemeBuilder/
├── blocks/
├── canvas/
├── context/
├── hooks/
├── panels/
└── index.ts
```

#### FSD Katman Hiyerarşisi (import yönü)

```
app → pages → widgets → features → entities → shared
```

Üst katman alt katmanı import edebilir; **alt katman üst katmanı import edemez**.

```
src/
  app/           # App shell: App.tsx (router), providers (AuthGuard, ThemeProvider)
  entities/      # Business entities — User model + Zustand store
  features/      # Self-contained features (Auth, MailingManagement, TenantSelector, ThemeBuilder)
  pages/         # Route-level page components — domain alt-klasörlerine bölünmüş
    admin/
    store-admin/
    ecommerce/
    storefront/
    auth/
  shared/        # Shared utilities and UI
    api/         # axiosConfig.ts — base client, interceptors, token refresh
    ui/          # Reusable components (Button, Input, Modal, AdvancedDataTable, etc.)
  widgets/       # Composite layout sections (Sidebar, Header)
```

**Design system:** Vanilla CSS with Glassmorphism — no Tailwind. CSS variables (`--surface-glass`, `--text-main`, `--border-glass`, `--radius-md`, etc.) defined globally. Component-level styles use CSS Modules (`.module.css`).

### ⚠️ ZORUNLU: Shared UI Component Kuralları

Admin ve store-admin panellerindeki her formda aşağıdaki **hazır bileşenler** kullanılmalıdır. Ham `<input>`, `<select>`, `<button>` kullanımı **kesinlikle yasaktır**:

| İhtiyaç | Kullanılacak Bileşen | Import Yolu |
|---|---|---|
| Text / number / url input | `<Input>` | `shared/ui/Input/Input` |
| Dropdown seçim | `<Select>` | `shared/ui/Select/Select` |
| Butonlar | `<Button variant="primary/ghost/danger">` | `shared/ui/Button/Button` |
| Modal pencere | `<Modal isOpen title size footer>` | `shared/ui/Modal/Modal` |
| Toggle / checkbox | `<Switch label>` | `shared/ui/Switch/Switch` |
| Görsel yükleme (server upload) | `<ImageUploadField>` | `shared/ui/ImageUploadField/ImageUploadField` |
| Çoklu seçim | `<MultiSelect>` | `shared/ui/MultiSelect/MultiSelect` |

**`Modal` kullanım kalıbı:**
```tsx
<Modal isOpen={isOpen} onClose={close} title="Başlık" size="md"
  footer={
    <>
      <Button variant="ghost" onClick={close}>İptal</Button>
      <Button variant="primary" isLoading={isSaving} onClick={handleSave}>Kaydet</Button>
    </>
  }
>
  {/* form içeriği */}
</Modal>
```

**Silme onayı da `<Modal>` ile yapılır:**
```tsx
<Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Sil" size="sm"
  footer={<><Button variant="ghost">Vazgeç</Button><Button variant="danger">Evet, Sil</Button></>}
>
  <p>Emin misiniz?</p>
</Modal>
```

**`Select` options formatı:** `{ label: string, value: string | number }[]`
- Boş seçenek options dizisine dahil edilir: `[{ label: '— Seçiniz —', value: '' }, ...items]`

**`ImageUploadField` kuralları:**
- `aspectRatio`: `"banner"` (geniş görsel) | `"square"` (avatar) | `"logo"` (marka logosu)
- Backend endpoint: `POST /api/v1/store-admin/upload` (multipart/form-data — Content-Type header **elle set edilmez**, axios otomatik yapar)
- Dosyalar `wwwroot/uploads/{tenantSlug}/{guid}{ext}` konumuna kaydedilir

**Layout yardımcı sınıfları** (bu sınıflar layout içindir, input stillemek için değil):
```tsx
import s from '../StoreAdminPage/pages/storeAdmin.shared.module.css';
// Kullanılabilir: s.page, s.pageHeader, s.titleRow, s.titleIcon, s.pageTitle,
//   s.pageSubtitle, s.formGrid, s.formRow, s.label (sadece textarea üstünde),
//   s.textarea, s.badgeActive, s.badgeInactive, s.muted, s.detailGrid,
//   s.detailField, s.detailLabel, s.detailValue, s.detailLink, s.sectionTitle
// YASAK: s.input, s.select, s.saveBtn, s.cancelBtn, s.modalOverlay, s.modal,
//   s.modalHeader, s.modalBody, s.modalFooter (bunlar artık Modal componenti tarafından karşılanıyor)
```

**AdvancedDataTable DTO kısıtı:** Interface'ler `extends Record<string, unknown>` olmalıdır.

**State:** Zustand (`useAuthStore` in `entities/User/model/store.ts`). Token stored in `localStorage`; store hydrates on app load.

**API:** `apiClient` at `shared/api/axiosConfig.ts` points to `http://localhost:5181/api/v1`. Interceptors attach the JWT `Authorization` header, `Accept-Language` (from `localStorage.lng`), and `X-Tenant-Slug` (from `localStorage['wixi-active-tenant']`). On 401, one silent refresh is attempted before redirecting to `/login`.

**Routing:** React Router v7. All admin routes under `/admin/*` are wrapped in `<AuthGuard>` (checks `isAuthenticated` from store).

## Key configuration

- **Connection string** (`appsettings.json` `DefaultConnection`): points to SQL Server. The design-time factory in `WixiCoreDbContextFactory.cs` has a hardcoded string for migrations.
- **JWT section name** in config is `JwtSettings`; the options class is `JwtOptions` bound to `JwtSettings`.
- **Rate limits** are per-IP fixed-window policies applied to every auth endpoint individually.
- **CORS** allows all origins (`SetIsOriginAllowed(_ => true)`) with credentials — lock this down before production.
- **Localization**: default culture is `tr-TR`; `Accept-Language` header selects the active culture.

## ECommerce module activation

The module is stubbed out and commented in `Program.cs` and `App.tsx`. To re-enable:
1. Uncomment `using Wixi.Modules.ECommerce;` and `builder.Services.AddECommerceModule(...)` in `Program.cs`.
2. Uncomment `app.UseECommerceModule()` and the migration helpers.
3. Add `Wixi.Modules.ECommerce` to `Wixi.Platform.sln`.
4. Re-enable ECommerce routes in `src/frontend/src/app/App.tsx`.
