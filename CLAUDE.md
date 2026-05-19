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

# EF Core migrations (run from repo root)
dotnet ef migrations add <MigrationName> \
  --project src/backend/Wixi.Modules.Core \
  --startup-project src/backend/Wixi.API \
  --output-dir Infrastructure/Data/Migrations

dotnet ef database update \
  --project src/backend/Wixi.Modules.Core \
  --startup-project src/backend/Wixi.API
```

## Architecture

### Monorepo layout
```
src/
  backend/            # .NET 9 solution (Wixi.Platform.sln)
  frontend/           # React 19 + Vite + TypeScript
docs/TASKS.md         # Phase-based task tracker synced to Linear
```

### Backend — Clean Architecture / CQRS

Three projects are in the solution:

| Project | Role |
|---|---|
| `Wixi.API` | ASP.NET Core Web API — controllers, `Program.cs`, Serilog, DI wiring |
| `Wixi.Modules.Core` | Core domain: Auth, Users, Roles, Menus, Languages, Mailing, Audit Logs |
| `Wixi.Modules.ECommerce` | SaaS e-commerce module (per-tenant DB) — **currently commented out** in `Program.cs` |
| `Wixi.Shared` | Shared config records (`JwtOptions`, `MailOptions`) and base interfaces (`IAuditable`) |

Every feature in `Wixi.Modules.Core` follows strict CQRS with MediatR:
- `Application/<Feature>/Commands/<Action>/` — `*Command.cs` + `*CommandHandler.cs`
- `Application/<Feature>/Queries/<Action>/` — `*Query.cs` + `*QueryHandler.cs`
- `Domain/Entities/` — EF Core entities prefixed with `Wixi*`
- `Infrastructure/Data/` — `WixiCoreDbContext`, `WixiCoreDbContextFactory` (design-time), migrations

**Auth flow:** Login → optional 2FA (OTP via email, HMAC-hashed in DB) → JWT access token + HttpOnly refresh token cookie. Token refresh is attempted once on 401 before logging out.

**Mail system:** `IMailQueue` (in-memory) → `MailingBackgroundWorker` (hosted service) → `IMailService` (MailKit) using Scriban templates stored in `WIXI_MAIL_TEMPLATES`.

**ECommerce multi-tenancy:** Each tenant gets its own database provisioned by `ECommerceTenantProvisioner`. Tenant is resolved from `X-Tenant-Slug` request header via `TenantMiddleware`. Master DB lives in `WixiCoreDbContext`; per-tenant DBs use `ECommerceDbContext`.

### Frontend — Feature-Sliced Design (FSD)

```
src/
  app/           # App shell: App.tsx (router), providers (AuthGuard, ThemeProvider)
  entities/      # Business entities — User model + Zustand store
  features/      # Self-contained features (Auth, MailingManagement, TenantSelector)
  pages/         # Route-level page components
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
