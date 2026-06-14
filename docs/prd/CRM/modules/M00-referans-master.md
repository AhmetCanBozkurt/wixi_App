# M00 — Referans Veri & Master

> **Durum:** ✅ Hazır (~%95) · **Faz:** Altyapı · **Öncelik:** — · **Detay:** ✔️ Analiz edildi (2026-06-14)
> [← INDEX'e dön](../INDEX.md)

## Kapsam
Platform genelinde tek olan, tenant'tan bağımsız tanımlama kartları ve master kimlik/abonelik verileri. Per-tenant tablolar bunlara **string kopya** ile referans verir (çapraz-DB FK yok).

---

## Master'da Ne Var? (mevcut, 4 mantıksal grup)

**1. Referans/Lookup kartları (REF_*) — CRM'in kullandığı kısım**
`WixiPort, WixiRegion (+Country/State/City), WixiTaxOffice, WixiIncoterm, WixiTransportMode, WixiPackageType, WixiUnit (+UnitCategory/UnitConversion), WixiHsCode, WixiService (+ServiceCategory), WixiCurrency (+ExchangeRate), WixiLanguage`

**2. Platform kimlik & tenant**
ASP.NET Identity (`WixiUser : IdentityUser<Guid>` → AspNetUsers/Roles/UserRoles), `WixiTenant, WixiSubscriptionPlan, WixiTenantSubscription, WixiRefreshToken, WixiTwoFactorCode`

**3. Ayarlar** — `WixiSmtpSetting, WixiCurrencySetting, WixiPlatformPaymentSetting, WixiMailTemplate`

**4. Landing/CMS içeriği** (dökümanda kapsanmamış, ayrı dünya) — `WixiCaseStudy, WixiRoadmap, WixiTeamMember, WixiChangelog, WixiFaq, WixiLegalDocument, WixiSystemPage, WixiThemeTemplate...`

> **Çok dillilik konvansiyonu:** Referans kartları inline `NameEn` alanı kullanır (basit). CMS içeriği ayrı `*Translation` tablosu kullanır (zengin). Yeni referans eklenirken bu ayrım korunur.

---

## İlgili Tablolar (ideal → mevcut)
| İdeal (Master) | Mevcut Entity | Durum |
|---|---|---|
| WIXI_USERS / ROLES / USER_ROLES | ASP.NET Identity (`WixiUser`) | ✅ |
| WIXI_REFRESH_TOKENS / OTP_CODES | `WixiRefreshToken` / `WixiTwoFactorCode` | ✅ |
| WIXI_TENANTS / SUBSCRIPTION_PLANS | `WixiTenant` / `WixiSubscriptionPlan` | ✅ |
| WIXI_CUSTOM_DOMAINS | — | ❌ (referans değil, tenant özelliği — düşük öncelik) |
| REF_REGIONS / PORTS / TAX_OFFICES / INCOTERMS / TRANSPORT_MODES / PACKAGE_TYPES | `WixiRegion`/`WixiPort`/`WixiTaxOffice`/`WixiIncoterm`/`WixiTransportMode`/`WixiPackageType` | ✅ |
| REF_UNITS / UNIT_CATEGORIES / UNIT_CONVERSIONS | `WixiUnit`/`WixiUnitCategory`/`WixiUnitConversion` | ✅ |
| REF_HS_CODES / SERVICES / SERVICE_CATEGORIES | `WixiHsCode`/`WixiService`/`WixiServiceCategory` | ✅ |
| (Para birimi / Dil) | `WixiCurrency`/`WixiExchangeRate`/`WixiLanguage` | ✅ |
| WIXI_MENUS | `WixiMenu` (+`WixiMenuTranslation`) | ✅ |
| **WIXI_CARGO_CARRIERS** (kargo firma kataloğu) | — | ❌ **Yeni — bkz. karar aşağıda** |

---

## Karar Çerçevesi (Master mı / Per-Tenant mı / Enum mu?)

Her yeni alan için:

| Nereye? | Kriter | Örnek |
|---|---|---|
| 🏛️ **Master** | Platform geneli, her mağazada **aynı**, ortak sözlük | Birim, Liman, Vergi Dairesi, Incoterm, Para Birimi, Dil, **Kargo firma kataloğu** |
| 🏪 **Per-Tenant** | Mağazaya özel **veri** veya **ayar** | Müşteri, sipariş, **kargo API anahtarı**, sadakat kuralı |
| 🔢 **Enum (kod)** | Küçük, sabit, **iş mantığı** (veri değil) | Sipariş durumu, ticket önceliği, iade nedeni |

**Bu çerçeveye göre kesinleşen kararlar:**
- ✅ Tüm REF_* kartları master'da doğru yerde — CRM için **yeni referans gerekmiyor**.
- ❌ Master'a **konmayacaklar** (yeni modüller gelince cazip ama yanlış): ticket kategorisi/önceliği → enum (M05); iade nedeni → enum (M09); RFM segment → per-tenant config (M02); sadakat seviyeleri → per-tenant `LYL_PROGRAMS` (M03); kampanya tetik tipi → enum (M11).

---

## ✅ KARAR: Kargo Firmaları — Master Katalog + Per-Tenant Anahtar

> Onaylandı (2026-06-14). Kargo firmaları **ikiye bölünür**:

**Master (yeni referans tablosu) — `WixiCargoCarrier`:**
Platform geneli sabit kargo firma kataloğu. Her mağaza sıfırdan tanımlamaz, bu listeden seçer.
```
WixiCargoCarrier (Core / referans)
  Id, Code (YurticiKargo|Aras|MNG|PTT|DHL|UPS|...),
  Name, NameEn,
  LogoRelativePath,      -- DOSYA → D-02: sunucu+relativePath (tam URL değil)
  TrackingUrlTemplate,   -- DIŞ LINK → D-02 istisnası: {trackingNo}'lu takip linki, URL string kalır
  IsInternational, SortOrder, IsActive
  -- API anahtarı YOK (platform seviyesinde tutulmaz)
```
> Logo bir **dosya** (D-02 kuralı: relativePath). TrackingUrlTemplate bir **dış link** (D-02 istisnası: URL string).

**Per-Tenant (M08) — `WixiCargoCarrierSetting`:**
Mağazanın hangi firmayı açtığı + kendi API kimlik bilgileri.
```
WixiCargoCarrierSetting (ECommerce / per-tenant)
  Id, CarrierCode (master'dan string kopya — FK yok),
  ApiKey, ApiSecret, CustomerCode (şifreli),
  DefaultDays, SlaDays, IsDefault, IsActive
```

**Bağlantı:** `WixiCargoCarrierSetting.CarrierCode` → `WixiCargoCarrier.Code` (string-kopya, çapraz-DB FK yok). → M08 detayını etkiler.

---

## Bağımlılıklar
Yok (en alt katman). Tüm diğer modüller buradan referans değer kopyalar.

## Açık Sorular
- `WIXI_CUSTOM_DOMAINS` ne zaman gerekli? (SaaS özel domain talebi doğunca — CRM dışı)
- Kargo katalog seed verisi (TR kargo firmaları) ilk kurulumda `SeedData.cs`'e eklenecek.

---

## 📋 Tam Referans Envanteri — Endpoint + Frontend (mevcut durum)

> **Önemli:** Tüm referans kartları **tek tip konvansiyon** kullanır. Çoğu zaten yazılmış (✅). Yeni alan eklerken bu kalıbı kopyala.
>
> **Backend:** `Controllers/ReferenceData/*` · `[Route("api/v1/ref")]` · 4 endpoint (GET list `AllowAnonymous` + POST/PUT/DELETE `SuperAdmin,Admin`) · CQRS `Application/ReferenceData/<Entity>/`
> **Frontend:** `pages/admin/DefinitionsPage/<Entity>Page.tsx` · route `/admin/definitions/<slug>` · `AdvancedDataTable` + `Modal` + shared UI

| Alan | Backend endpoint (`api/v1/...`) | Frontend Page | Route (`/admin/...`) | Durum |
|---|---|---|---|:---:|
| Bölge (Ülke/İl/İlçe) | `ref/regions` | `RegionsPage` | `definitions/regions` | ✅ |
| Liman | `ref/ports` | `PortsPage` | `definitions/ports` | ✅ |
| Ödeme Koşulu | `ref/payment-terms` | `PaymentTermsPage` | `definitions/payment-terms` | ✅ |
| Vergi Dairesi | `ref/tax-offices` | `TaxOfficesPage` | `definitions/tax-offices` | ✅ |
| Incoterm | `ref/incoterms` | `IncotermsPage` | `definitions/incoterms` | ✅ |
| Taşıma Modu | `ref/transport-modes` | `TransportModesPage` | `definitions/transport-modes` | ✅ |
| Paket Tipi | `ref/package-types` | `PackageTypesPage` | `definitions/package-types` | ✅ |
| Birim Kategorisi | `ref/unit-categories` | `UnitCategoriesPage` | `definitions/unit-categories` | ✅ |
| Birim | `ref/units` | `UnitsPage` | `definitions/units` | ✅ |
| Birim Dönüşümü | `ref/unit-conversions` | `UnitConversionsPage` | `definitions/unit-conversions` | ✅ |
| Hizmet Kategorisi | `ref/service-categories` | `ServiceCategoriesPage` | `definitions/service-categories` | ✅ |
| Hizmet | `ref/services` | `ServicesPage` | `definitions/services` | ✅ |
| HS Kod (gümrük) | `ref/hs-codes` | `HsCodesPage` | `definitions/hs-codes` | ✅ |
| Ürün Açıklaması | `ref/product-descriptions` | `ProductDescriptionsPage` | `definitions/product-descriptions` | ✅ |
| Sistem Sayfası | `ref/system-pages` | `SystemPagesPage` | `definitions/system-pages` | ✅ |
| Para Birimi | `currency` (+`/settings`, `/set-base`) | `CurrencyManagementPage` | `currencies` | ✅ |
| Döviz Kuru | `exchange-rates` (+`/sync-tcmb`, `/convert`, `/parity`) | `ExchangeRatePage` | `exchange-rates` | ✅ |
| Para Ayarları | `currency/settings` | `CurrencySettingsPage` | `currency-settings` | ✅ |
| Dil | `language` | `LanguageManagementPage` | `languages` | ✅ |
| **Kargo Firma Kataloğu** | **`ref/cargo-carriers`** | **`CargoCarriersPage`** | **`definitions/cargo-carriers`** | ❌ **YENİ** |
| Özel Domain (SaaS) | `ref/custom-domains` (öneri) | `CustomDomainsPage` | `definitions/custom-domains` | ❌ Düşük öncelik |

**Sonuç:** 19 referans alanı **tam yazılmış**. M00 kapsamında **yazılacak yeni iş = sadece 2 alan**: Kargo Firma Kataloğu (CRM için gerekli) + Özel Domain (düşük öncelik, CRM dışı). Her ikisi de yukarıdaki hazır kalıbı kopyalar.

---

## 🚚 `WixiCargoCarrier` Katalog — Uygulama Spesifikasyonu

> Mevcut referans yönetim pattern'i ile **birebir aynı** (örnek: `Incoterm`). Master katalog = **platform admin** yönetir (`/admin/definitions/*`). Per-tenant API anahtarları M08'de, store-admin tarafında.

### Domain (Core)
```
Wixi.Modules.Core/Domain/Entities/WixiCargoCarrier.cs   → IAuditable
  Id, Code, Name, NameEn, LogoRelativePath (dosya→D-02), TrackingUrlTemplate (dış link→D-02 istisna),
  IsInternational (bool), SortOrder (int), IsActive, IsDeleted, audit alanları
+ WixiCoreDbContext'e  DbSet<WixiCargoCarrier> CargoCarriers
+ Migration (Core/Infrastructure/Data/Migrations/, idempotent)
+ SeedData.cs'e TR kargo firmaları (Yurtiçi/Aras/MNG/PTT/UPS/DHL)
```

### Backend — Application (CQRS) — `Application/ReferenceData/CargoCarrier/`
```
Commands/CreateCargoCarrierCommand.cs   (+ Handler)
Commands/UpdateCargoCarrierCommand.cs   (+ Handler)
Commands/DeleteCargoCarrierCommand.cs   (+ Handler)
Queries/GetCargoCarriersQuery.cs        (+ Handler)
Dto/CargoCarrierDto.cs
```

### Backend — Endpoint'ler
Controller: `Wixi.API/Controllers/ReferenceData/CargoCarriersController.cs` · namespace `Wixi.API.Controllers.ReferenceData` · `[Route("api/v1/ref")]`

| Metot | Route | Yetki | Açıklama |
|---|---|---|---|
| GET | `/api/v1/ref/cargo-carriers` | `AllowAnonymous` | Liste (store-admin select + storefront) → `{ items: [...] }` |
| POST | `/api/v1/ref/cargo-carriers` | `SuperAdmin,Admin` | Yeni katalog kaydı |
| PUT | `/api/v1/ref/cargo-carriers` | `SuperAdmin,Admin` | Güncelle (body'de `id`) |
| DELETE | `/api/v1/ref/cargo-carriers/{id}` | `SuperAdmin,Admin` | Sil (soft delete) |

### Frontend — Dosya Yapısı
Mevcut `DefinitionsPage` konvansiyonu (her referans = tek `.tsx`, ortak CSS):
```
src/frontend/src/pages/admin/DefinitionsPage/
  CargoCarriersPage.tsx        ← YENİ (IncotermsPage.tsx şablonu)
  definitions.module.css       ← mevcut, paylaşılan
```
**`CargoCarriersPage.tsx` içeriği (IncotermsPage pattern'i):**
- `interface CargoCarrierItem extends Record<string, unknown>` (AdvancedDataTable kısıtı)
- `AdvancedDataTable` (liste) + `Modal` (ekle/düzenle) + silme onayı `Modal`
- Form alanları **zorunlu shared UI** ile: `Input` (Code, Name, NameEn, TrackingUrlTemplate, SortOrder), `ImageUploadField` (logo → relativePath, D-02), `Switch` (IsInternational, IsActive)
- API: `apiClient.get/post/put/delete('ref/cargo-carriers')` + `toast`

### Frontend — Route & Menü
```
App.tsx:
  import { CargoCarriersPage } from '../pages/admin/DefinitionsPage/CargoCarriersPage';
  <Route path="definitions/cargo-carriers" element={<CargoCarriersPage />} />   // /admin/definitions/cargo-carriers
```
- Menü: `WIXI_MENUS`'e "Tanımlamalar" klasörü altına SQL ile eklenir (TEST DB) — TR/EN çeviri zorunlu (bkz. CLAUDE.md menü şablonu).

---

## Detay Tasarım (TODO)
- [x] Karar çerçevesi netleşti (master/per-tenant/enum)
- [x] Kargo firma master+per-tenant ayrımı kararı
- [x] `WixiCargoCarrier` katalog frontend + endpoint spesifikasyonu
- [ ] **Backend:** `WixiCargoCarrier` entity + DbSet + migration (Core)
- [ ] **Backend:** CQRS (Create/Update/Delete/Get) + `CargoCarriersController`
- [ ] **Backend:** TR kargo firmaları seed (`SeedData.cs`)
- [ ] **Frontend:** `CargoCarriersPage.tsx` + App.tsx route + import
- [ ] **DB:** "Tanımlamalar" menüsüne SQL ile madde ekle (TEST DB, TR+EN)
- [ ] (Düşük öncelik) `WIXI_CUSTOM_DOMAINS` entity
