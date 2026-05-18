# Theme Editor — Geliştirme Analizi

**Tarih:** 2026-05-18  
**Durum:** Analiz / Planlama

---

## Mevcut Durum

### Çalışan Özellikler
- **CSS Değişkenleri:** 24 adet (renkler, tipografi, border-radius, gölgeler) → canlı WYSIWYG önizleme
- **Sayfa Bölümleri:** 16 blok türü (Hero, Ürünler, FAQ, Custom HTML...) drag-reorder + props düzenleme
- **SEO, backlinks, sayfa yönetimi**
- **Viewport önizleme:** Desktop / Tablet / Mobil
- **Backend:** `themeConfigJson` + `layoutConfigJson` `WixiStoreSettings`'te persist ediliyor

### Eksikler
- Navbar / Footer **hardcoded JSX** — Theme Editor'dan düzenlenemiyor
- Global bileşenler için config paneli yok
- Kod seviyesinde müdahale imkânı yok
- Versiyon geçmişi ve geri alma mekanizması yok

---

## Hedef Mimari — A+B Kombinasyonu

### Katman 1 — Global Components Panel (Config-based + Visual Presets)

Shopify / BigCommerce'in kullandığı profesyonel yaklaşım:  
Teknik olmayan store admin, kod yazmadan Navbar/Footer yapısını değiştirebilir.

**Theme Editor sol paneline yeni sekme: "Global Bileşenler"**

```
┌─ Navbar ──────────────────────────────────┐
│  Düzen Şablonu  : [Klasik | Ortalı | Mega]│
│  Logo Pozisyonu : [Sol | Orta]            │
│  Sticky Header  : [Açık ●]               │
│  Arama Kutusu   : [Açık ●]               │
│  Dil Seçici     : [Kapalı ○]             │
└───────────────────────────────────────────┘
┌─ Footer ──────────────────────────────────┐
│  Kolon Düzeni   : [1 | 2 | 3 | 4 Kolon]  │
│  Sosyal İkonlar : [Açık ●]               │
│  Newsletter     : [Kapalı ○]             │
│  Copyright Metni: [___________________]  │
└───────────────────────────────────────────┘
```

**Backend — Yeni Alan:**  
`WixiStoreSettings.GlobalComponentsConfigJson` (JSON text)

**Yeni DTO:** `GlobalComponentsConfig`
```csharp
public record NavbarConfig(
    string Layout,        // "classic" | "centered" | "mega"
    string LogoPosition,  // "left" | "center"
    bool   IsSticky,
    bool   ShowSearch,
    bool   ShowLanguagePicker
);

public record FooterConfig(
    int    ColumnCount,   // 1-4
    bool   ShowSocials,
    bool   ShowNewsletter,
    string CopyrightText
);

public record GlobalComponentsConfig(
    NavbarConfig Navbar,
    FooterConfig Footer
);
```

**Storefront bileşenleri** `GlobalComponentsConfig`'i okuyacak şekilde güncellenir:
- `StorefrontNavbar.tsx` → `useGlobalComponents()` hook'u → `navbar.layout` prop'una göre variant render
- `StorefrontFooter.tsx` → `footer.columnCount` prop'una göre grid düzeni

---

### Katman 2 — Kod Editörü (Store Admin)

Store admin'in sayfa bazlı CSS ve HTML'ini doğrudan düzenleyebildiği Monaco tabanlı editör.

**Kapsam:**
- **Custom CSS Override:** Store genelinde geçerli CSS (`:root` değişken ezilebilir, `.sf-navbar` vs.)
- **Sayfa bazlı Custom HTML:** Zaten var olan Custom HTML blok ile entegre
- **Custom JS:** Opsiyonel — analytics snippet, chat widget gibi harici kodlar için

**Veri Yapısı:**
```
WixiStoreSettings
  + GlobalComponentsConfigJson  (nvarchar(max))
  + CustomCssOverride            (nvarchar(max))
  + CustomJsOverride             (nvarchar(max))
```

**Frontend:**  
Theme Editor'a "Kod" sekmesi → Monaco Editor (CSS + HTML modları)  
Kaydet → `PUT /api/v1/store-admin/settings` mevcut endpoint genişletilir.

---

### Katman 3 — Tema Versiyonlama Sistemi

Her kaydetme işleminde tam snapshot alınır; herhangi bir önceki versiyona geri alınabilir.  
Shopify / Webflow'un kullandığı **snapshot-based versioning** yaklaşımı.

---

#### 3.1 Versiyon Kapsamı

Bir "versiyon" aşağıdaki alanların tamamının anlık görüntüsüdür:

| Alan | Açıklama |
|---|---|
| `ThemeConfigJson` | Renkler, tipografi, spacing, radius, gölgeler |
| `GlobalComponentsConfigJson` | Navbar / Footer yapı ayarları |
| `CustomCssOverride` | Kod editöründen yazılan CSS |
| `CustomJsOverride` | Kod editöründen yazılan JS |

> Sayfa layout'ları (`layoutConfigJson`) **sayfa bazlı** tutulduğu için tema versiyonlarından ayrı yapıda saklanır. İleride sayfa versiyonlaması ayrı bir modül olarak eklenebilir.

---

#### 3.2 Versiyon Tipleri

| Tip | Açıklama | Otomatik mi? |
|---|---|---|
| `auto` | Her "Kaydet" tıklamasında oluşur | ✅ Evet |
| `checkpoint` | Store admin'in elle isimlendirdiği önemli nokta | Hayır |
| `template_apply` | Şablon uygulandığında sistem tarafından oluşturulur | ✅ Evet |
| `super_admin` | Super Admin'in müdahalesiyle oluşturulur | ✅ Evet |
| `rollback` | Eski versiyona dönüldüğünde oluşan yeni versiyon | ✅ Evet |

---

#### 3.3 Yeni Entity — `WixiThemeVersion`

`ECommerceDbContext` içinde — her tenant'ın kendi DB'sinde tutulur (tenant izolasyonu).

```csharp
public class WixiThemeVersion
{
    public int    Id                         { get; set; }
    public int    StoreSettingsId            { get; set; }
    public int    VersionNumber              { get; set; }  // store bazlı artan sayaç (1, 2, 3...)

    // Tam snapshot
    public string ThemeConfigJson            { get; set; }
    public string GlobalComponentsConfigJson { get; set; }
    public string CustomCssOverride          { get; set; }
    public string CustomJsOverride           { get; set; }

    // Metadata
    public string  VersionLabel             { get; set; }  // null → otomatik; dolu → checkpoint adı
    public string  VersionType              { get; set; }  // auto | checkpoint | template_apply | super_admin | rollback
    public bool    IsPublished              { get; set; }  // store'da şu an yayında olan versiyon (tekil)
    public int?    RestoredFromVersionId    { get; set; }  // type=rollback ise hangi versiyondan alındı
    public string? TemplateAppliedName      { get; set; }  // type=template_apply ise şablon adı
    public string  ChangedByUserId          { get; set; }
    public string  ChangedByEmail           { get; set; }
    public DateTime CreatedAt               { get; set; }

    // Navigation
    public WixiStoreSettings StoreSettings { get; set; }
    public WixiThemeVersion? RestoredFrom  { get; set; }
}
```

**İndeksler:**
```sql
INDEX IX_ThemeVersion_StoreSettings  ON WixiThemeVersions (StoreSettingsId, VersionNumber DESC)
INDEX IX_ThemeVersion_Published       ON WixiThemeVersions (StoreSettingsId, IsPublished)
```

---

#### 3.4 Plan Bazlı Versiyon Limitleri

| Plan | Versiyon Limiti | Checkpoint Koruması |
|---|---|---|
| Free | Son 10 versiyon | ✅ Checkpoint'ler silinmez |
| Starter | Son 25 versiyon | ✅ |
| Pro | Son 50 versiyon | ✅ |
| Enterprise | Sınırsız | ✅ |

**Otomatik temizleme:** Limit aşıldığında en eski `auto` tipi versiyonlar silinir. `checkpoint`, `template_apply`, `super_admin` tipler korunur.

**Depolama tahmini:** Ortalama tema snapshot ~3 KB → 50 versiyon × 3 KB = 150 KB / store → 1.000 store = 150 MB (önemsiz)

---

#### 3.5 Kaydetme Akışı

```
Store admin "Kaydet" tıklar
    ↓
1. Mevcut published versiyon IsPublished = false
2. Yeni WixiThemeVersion oluştur (type: auto, IsPublished: true)
3. WixiStoreSettings alanlarını güncelle
4. Plan limitini kontrol et → limit aşıldıysa en eski auto versiyonu sil
5. Başarı response + yeni versiyon numarasını döndür
```

---

#### 3.6 Geri Alma (Rollback) Akışı

```
Store admin "v11'e Geri Dön" tıklar
    ↓
1. v11 snapshot içeriğini oku
2. Yeni WixiThemeVersion oluştur:
     type: rollback
     RestoredFromVersionId: 11
     VersionLabel: "v11'den geri alındı"
     IsPublished: true
3. Önceki published versiyon IsPublished = false
4. WixiStoreSettings alanlarını v11 snapshot ile güncelle
5. Editor canvas'ı yeni state ile yenile
```

> Geçmiş hiçbir zaman silinmez. Rollback her zaman **yeni versiyon** olarak eklenir.

---

#### 3.7 Draft / Publish Akışı (İleri Seviye)

Store admin'in canlı mağazayı etkilemeden tema değişikliği hazırlayabilmesi:

```
Theme Editor'da düzenleme yapılır
    ↓
"Taslağı Kaydet" → type: auto, IsPublished: false (draft)
    ↓ (canlı mağaza son published versiyonu göstermeye devam eder)
"Yayınla" → mevcut versiyon IsPublished = true
    ↓
Storefront bu versiyonu gösterir
```

---

#### 3.8 Versiyon Geçmişi UI — Theme Editor

```
┌─ Sürüm Geçmişi ──────────────────────────────────────┐
│  [+ Checkpoint Oluştur]              [Tümünü Gör]     │
│                                                        │
│  ● v14 — Az önce          [YAYINDA]                   │
│    Otomatik kayıt                                      │
│                                                        │
│  ○ v13 — 2 saat önce      [Checkpoint]                │
│    "Black Friday Hazırlığı"              [Geri Al] ↩  │
│                                                        │
│  ○ v10 — Dün                                          │
│    Şablon uygulandı: "Modern Store"      [Geri Al] ↩  │
│                                                        │
│  ○ v8  — 3 gün önce                                   │
│    Super Admin güncellemesi              [Geri Al] ↩  │
│                                                        │
│  ○ v5  — 1 hafta önce     [Checkpoint]                │
│    "Lansman Teması"                      [Geri Al] ↩  │
│                                            [Fark]  Δ  │
└──────────────────────────────────────────────────────┘
```

**[Fark] butonu:** İki versiyon arasındaki değişen alanları JSON diff olarak gösterir (örn. `primaryColor: #ec4899 → #3b82f6`).

---

### Katman 4 — Super Admin Merkezi Tema Yönetimi

Super Admin tüm tenant'ların tema yapılandırmalarını tek ekrandan görebilir, düzenleyebilir, geri alabilir ve toplu güncelleyebilir.

**Kullanım Senaryoları:**
- Platform genelinde tasarım güncellemesi → tüm "Free plan" store'lara toplu uygula
- Belirli bir tenant'ın tema geçmişini görüp herhangi bir versiyona geri al
- `super_admin` tipi otomatik versiyon oluşturulur → müdahale izlenebilir
- Yeni default tema şablonu oluştur → seçili tenant'lara push et

**Yeni Sayfalar (Super Admin Panel):**

```
/admin/theme-management
├── Tüm Store'ların Tema Listesi
│     Tenant | Plan | Versiyon | Son Değişiklik | Değiştiren | [Geçmiş] [Düzenle] [Sıfırla]
│     [ ] [ ] [ ] ... Toplu Seç → [Şablonu Uygula]
│
└── /admin/theme-management/{tenantId}/history
      Versiyon listesi (tüm tipler) + [Bu Versiyona Zorla Geri Al]
```

**Backend — Yeni Endpointler:**

```
GET    /api/v1/admin/theme-management/stores
         → Tüm tenant özeti: tenantId, name, plan, currentVersionNumber, lastChangedAt, lastChangedBy

GET    /api/v1/admin/theme-management/stores/{tenantId}/versions
         → Tenant'ın tüm versiyon listesi (meta + VersionLabel, type, isPublished — JSON yok)

GET    /api/v1/admin/theme-management/stores/{tenantId}/versions/{versionId}
         → Belirli versiyonun tam snapshot'ı

POST   /api/v1/admin/theme-management/stores/{tenantId}/rollback
         Body: { versionId: int, reason: string }
         → super_admin tipi yeni versiyon oluştur + publish et

PUT    /api/v1/admin/theme-management/stores/{tenantId}
         Body: ThemeConfigJson + GlobalComponentsConfigJson + ...
         → Direkt güncelle (type: super_admin versiyon oluşturur)

POST   /api/v1/admin/theme-management/bulk-apply
         Body: { tenantIds: [...], themeTemplateId: int }
         → Her tenant için super_admin tipi versiyon oluştur + publish et (background job)

GET/POST/PUT/DELETE  /api/v1/admin/theme-templates
         → Tema şablonu CRUD
```

**Yeni Entity — `WixiThemeTemplate` (Core DB — tenant-bağımsız):**
```csharp
public class WixiThemeTemplate : IAuditable
{
    public int    Id                         { get; set; }
    public string Name                       { get; set; }
    public string Description                { get; set; }
    public string PreviewImageUrl            { get; set; }
    public string ThemeConfigJson            { get; set; }
    public string GlobalComponentsConfigJson { get; set; }
    public string CustomCssOverride          { get; set; }
    public bool   IsDefault                  { get; set; }
    public bool   IsActive                   { get; set; }
    // IAuditable: CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
}
```

---

## Uygulama Sırası

| Faz | Kapsam | Tahmini Süre |
|-----|--------|--------------|
| **Faz 1** | `GlobalComponentsConfig` DTO + migration + Store Admin Global Panel (Navbar/Footer config UI) | 4-5 saat |
| **Faz 2** | Monaco Code Editor + `CustomCssOverride` / `CustomJsOverride` alanları + Theme Editor "Kod" sekmesi | 3-4 saat |
| **Faz 3** | `WixiThemeVersion` entity + migration + kaydetme/yayınlama akışı + plan limit servisi | 4-5 saat |
| **Faz 4** | Theme Editor "Sürüm Geçmişi" paneli + rollback UI + checkpoint oluşturma | 3-4 saat |
| **Faz 5** | `WixiThemeTemplate` entity + Super Admin tema listesi + tek tenant versiyon yönetimi + düzenleme | 4-5 saat |
| **Faz 6** | Toplu uygulama endpoint (background job) + bulk apply UI + Super Admin rollback | 3-4 saat |

**Toplam tahmini:** ~21-27 saat

---

## Etkilenen Dosyalar

### Backend
```
Wixi.Modules.ECommerce/
  Domain/Entities/
    WixiStoreSettings.cs               ← +GlobalComponentsConfigJson, +CustomCssOverride, +CustomJsOverride
    WixiThemeVersion.cs                ← YENİ
  Application/StoreSettings/
    Dto/StoreSettingsDto.cs            ← yeni alanlar
    Dto/GlobalComponentsConfig.cs      ← YENİ record
    Commands/UpdateStoreSettings/      ← versiyon oluşturma mantığı eklenir
  Application/ThemeVersions/           ← YENİ klasör
    Queries/GetThemeVersions/
    Commands/RollbackThemeVersion/
    Commands/CreateCheckpoint/
  Infrastructure/Data/
    ECommerceDbContext.cs              ← WixiThemeVersions DbSet + indeksler
    Migrations/                        ← yeni migration

Wixi.Modules.Core/
  Domain/Entities/WixiThemeTemplate.cs ← YENİ
  Infrastructure/Data/
    WixiCoreDbContext.cs               ← WixiThemeTemplates DbSet
    Migrations/                        ← yeni migration

Wixi.API/
  Controllers/
    StoreAdminSettingsController.cs    ← genişletilir
    ThemeVersionsController.cs         ← YENİ (store admin versiyon endpointleri)
    ThemeManagementController.cs       ← YENİ (super admin)
```

### Frontend
```
src/frontend/src/
  pages/StoreAdminPage/pages/ThemeEditor/
    panels/
      GlobalPanel.tsx                  ← YENİ (Navbar/Footer config)
      CodeEditorPanel.tsx              ← YENİ (Monaco embed)
      VersionHistoryPanel.tsx          ← YENİ (sürüm geçmişi + rollback)
    context/EditorContext.tsx          ← globalComponents + versions state eklenir
    hooks/useThemeEditor.ts            ← saveWithVersion, rollback, createCheckpoint

  widgets/
    StorefrontNavbar/StorefrontNavbar.tsx  ← config'e göre variant render
    StorefrontFooter/StorefrontFooter.tsx  ← config'e göre grid düzeni

  pages/AdminDashboardPage/
    ThemeManagementPage/
      ThemeManagementPage.tsx          ← YENİ (tüm tenant listesi)
      TenantThemeHistoryPage.tsx       ← YENİ (tek tenant versiyon geçmişi)
      ThemeTemplatesPage.tsx           ← YENİ (şablon CRUD)
```

---

## Teknik Notlar

- **Monaco Editor:** `@monaco-editor/react` — lazy load ile yüklenir, ilk bundle'a dahil edilmez
- **Snapshot boyutu:** Ortalama ~3 KB/versiyon → 50 versiyon × 3 KB = 150 KB/store → ölçek sorunu yok
- **Rollback asla silmez:** Her rollback yeni versiyon oluşturur; tarihsel kayıt bozulmaz
- **Toplu uygulama:** 100+ tenant için `ExecuteUpdateAsync` + background job (IHostedService veya Hangfire)
- **Super Admin override audit:** Her `super_admin` tipi versiyon `WixiAuditLog`'a da yazılır — kimin ne zaman neyi değiştirdiği izlenebilir
- **Custom CSS güvenlik:** Storefront `<head>`'e `<style>` olarak inject edilir; JS ayrı `<script>` bloğu — her ikisi de sadece kendi tenant domain'inde etkili, XSS yüzey alanı tenant scope ile sınırlı
- **IsPublished tekil kısıtı:** DB seviyesinde filtered unique index → `WHERE IsPublished = 1` per `StoreSettingsId` (SQL Server filtered index)
- **Versiyon diff:** İki versiyon arasındaki fark frontend'de `deep-diff` veya benzeri küçük kütüphane ile hesaplanır; backend'e diff endpoint'i gerekmez
- **Plan limit servisi:** `ThemeVersionCleanupService` — kaydetme sonrası çağrılır, plan limitini kontrol eder, `auto` tipi eski versiyonları atar
