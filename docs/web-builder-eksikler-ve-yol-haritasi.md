# Wixi Web Builder & Theme Builder — Mevcut Durum, Eksikler ve Profesyonel Yol Haritası

**Tarih:** 2026-06-13
**Kaynaklar:** Kod tabanı analizi (`features/ThemeBuilder`, `features/WebBuilder`, `Wixi.Modules.WebBuilder`), [`docs/PRD/web-builder-ux-grid-nesting-prd.md`](PRD/web-builder-ux-grid-nesting-prd.md), [`docs/TASKS.md`](TASKS.md), ClickUp görev takibi (Wixi_App folder)
**Amaç:** Webflow / Shopify Plus / Framer seviyesinde profesyonel bir Web Builder + Theme Builder ürününe ulaşmak için yapılanların, açık görevlerin ve eksiklerin tek dokümanda toplanması.

---

## 1. Mimari Genel Bakış (Mevcut Sistem)

İki ayrı editör, ortak bir çekirdek üzerinde çalışır:

| Editör | Rota | Hedef Veri | Backend |
|---|---|---|---|
| **Theme Builder** (`features/ThemeBuilder`) | `/corp/theme-editor/:tenantSlug` | Mağaza sayfaları (StorePages, ThemeVersions) | `Wixi.Modules.ECommerce` (tenant DB) |
| **Web Builder** (`features/WebBuilder`) | `WebBuilderEditorPage` (corporate) | Kurumsal sayfalar (CorpPages) | `Wixi.Modules.WebBuilder` (tenant DB) |

**Ortak çekirdek:** `WebBuilderEditor.tsx`, ThemeBuilder'ın `EditorContext`, `ComponentsPanel`, `LayersPanel`, `PropertiesPanel`, `EditorCanvas` ve CSS'ini doğrudan import eder. Yani **canvas/panel tarafında yapılan her geliştirme iki editöre birden yansır** — bu bilinçli ve korunması gereken bir mimari karar.

### 1.1. Frontend Bileşenleri

```
features/ThemeBuilder/            ← ortak çekirdek (3.770+ satır)
├── ThemeEditor.tsx               ← mağaza editör shell'i (305 satır)
├── blocks/blockRegistry.ts       ← 38 blok şeması, children[], group, toCss() (1.607 satır)
├── canvas/EditorCanvas.tsx       ← render + drag-drop + floating toolbar (1.581 satır)
├── context/EditorContext.tsx     ← reducer (nested aksiyonlar, hide/lock/move)
├── hooks/useThemeEditor.ts
└── panels/                       ← Components, Layers, Properties, Pages, Seo,
                                     Global, Theme, CodeEditor (Monaco), VersionHistory, Backlinks

features/WebBuilder/              ← kurumsal editör shell'i
├── WebBuilderEditor.tsx          (278 satır)
├── hooks/useWebBuilder.ts
└── panels/ WebPages, WebSeo, WebBacklinks, WebVersionHistory, DesignPanel
```

### 1.2. Backend — `Wixi.Modules.WebBuilder` (tenant başına DB)

| Feature | Komutlar / Sorgular | Entity'ler |
|---|---|---|
| **CorpPages** | Create, Delete, Publish, UpdateLayout, UpdateSeo, UpdateBacklinks, CreateVersion, RollbackVersion, GetBySlug, GetVersions | `WixiCorpPage`, `WixiCorpPageVersion` |
| **Blog** | Kategori + Post CRUD, Publish, GetBySlug | `WixiBlogPost`, `WixiBlogCategory` |
| **Forms** | WebForm CRUD, Submit, GetSubmissions | `WixiWebForm`, `WixiWebFormSubmission` |
| **CorpSettings** | Get / Update | `WixiCorpSettings` |

Provisioning: `WebBuilderTenantProvisioner` (`ModuleName = "webbuilder"`) — onboarding'de modül seçilirse tenant DB'sine migrate edilir.

### 1.3. Mevcut Blok Kütüphanesi (38 blok)

- **E-ticaret:** hero, hero-split, featured-products, categories-grid, brand-logos, promo-banner, countdown, slider, newsletter, testimonials
- **Kurumsal:** hero-corporate, about-company, team-grid, services-grid, features-highlight, process-steps, pricing-plans, clients-logos, awards-certifications, numbers-counter, cta-banner, contact-details, blog-list, timeline, portfolio-grid, map-embed, phone-contact
- **İçerik:** text, rich-text, text-image, stats-bar, video-embed, faq, contact-form, custom-html
- **Yapısal (nesting):** `section-container`, `grid-row`, `grid-column` ✅

---

## 2. Tamamlanan İşler (Geçmiş Görevler)

### 2.1. ThemeBuilder v2 (ClickUp — tamamı complete)

| Görev | ClickUp |
|---|---|
| P0 — Undo/Redo, Kopyala/Yapıştır, Klavye Kısayolları, Bileşen Arama | [86exq4ryv](https://app.clickup.com/t/86exq4ryv) |
| P1 — Katmanlar Paneli (Layer Panel) | [86exq4t0m](https://app.clickup.com/t/86exq4t0m) |
| PRD Katman 1 — GlobalComponents (Navbar/Footer) Storefront Entegrasyonu | [86exq4y1g](https://app.clickup.com/t/86exq4y1g) |
| PRD Katman 2 — Monaco Kod Editörü Storefront Enjeksiyonu | [86exq511q](https://app.clickup.com/t/86exq511q) |
| PRD Katman 3 — Tema Versiyonlama Sistemi | [86exq7hga](https://app.clickup.com/t/86exq7hga) |

### 2.2. ThemeBuilder Redesign (ClickUp — tamamı complete)

| Görev | ClickUp |
|---|---|
| blockRegistry: `children[]`, `group`, `toCss()` | [86exq7je7](https://app.clickup.com/t/86exq7je7) |
| EditorContext: `selectedPropKey` + `SELECT_PROP` action | [86exq7jek](https://app.clickup.com/t/86exq7jek) |
| CSS Visual Overhaul (dot grid, floating toolbar, inspect styles) | [86exq7jez](https://app.clickup.com/t/86exq7jez) |
| LayersPanel: Hiyerarşik Ağaç + Navbar/Footer sabit satırlar | [86exq7jfd](https://app.clickup.com/t/86exq7jfd) |
| PropertiesPanel: Inspect Tab + CSS Output + Prop Grouping | [86exq7jfp](https://app.clickup.com/t/86exq7jfp) |
| EditorCanvas: Floating Toolbar + InsertZone + Navbar/Footer Preview + Element Click | [86exq7jn6](https://app.clickup.com/t/86exq7jn6) |

### 2.3. Web Builder UX, Grid & Nesting Fazları (kısmen tamamlandı)

| Faz | Durum (ClickUp) | ClickUp |
|---|---|---|
| Faz 2 — Kapsayıcı Katmanlar & Nested Layout Mimarisi | ✅ complete | [86exrevqy](https://app.clickup.com/t/86exrevqy) |
| Faz 4 — Viewport Duyarlılık Çözümü & Premium Efektler | ✅ complete | [86exrevrc](https://app.clickup.com/t/86exrevrc) |

### 2.4. Diğer Tamamlanan İlgili İşler

- Editor Canvas UX iyileştirmeleri: satır/kolon taşıma, gizle/kilitle, kolon ekle/sil, Navbar/Footer inline düzenleme panelleri (`NavbarPropertiesPanel`, `FooterPropertiesPanel`) — bkz. `docs/TASKS.md` "Editor Canvas UX" bölümü
- Tema Editörü'nün bağımsız `/corp/theme-editor/:tenantSlug` rotasına taşınması + tenant badge kartı
- Theme Editor versiyon geçmişi checkpoint 500 hatası fix — [86exnk1mc](https://app.clickup.com/t/86exnk1mc)
- Navbar/Footer per-component özel CSS/JS kod editörü — [86exnk3jd](https://app.clickup.com/t/86exnk3jd)
- Navbar duplikasyon bug fix (Storefront) — [86exn8hqn](https://app.clickup.com/t/86exn8hqn)

---

## 3. Açık Görevler (ClickUp — Önceki Planlanan İşler)

> Ana görev: **[Web Builder] UX, Grid Snap ve Nesting Geliştirmeleri** — [86exrevqk](https://app.clickup.com/t/86exrevqk) (`to do`, high, liste: Store Admin `901818217840`)

| # | Görev | Durum | Öncelik | ClickUp |
|---|---|---|---|---|
| 1 | **Faz 3: 12-Kolon Dinamik Grid Sistemi** | 🔵 **in progress** | high | [86exrf0t4](https://app.clickup.com/t/86exrf0t4) |
| 2 | Faz 1: Şema Tabanlı Modal Veri Girişi (Quick Win) | ⬜ to do | high | [86exrevqp](https://app.clickup.com/t/86exrevqp) |
| 3 | Faz 3: Izgara Yapışma (Grid Snapping) & Sürükleme Kılavuzları | ⬜ to do | normal | [86exrevr2](https://app.clickup.com/t/86exrevr2) |
| 4 | Faz 5: İleri Seviye AI Entegrasyonu & SaaS Kredi Modeli | ⬜ to do | normal | [86exrevrh](https://app.clickup.com/t/86exrevrh) |
| 5 | Faz 6: Custom HTML Şablon Pazarı (Marketplace & Presets) | ⬜ to do | normal | [86exrevrr](https://app.clickup.com/t/86exrevrr) |
| 6 | ThemeBuilder v2 P1 — Drag & Drop Yeniden Sıralama (@dnd-kit) | ⬜ to do | high | [86exq4t46](https://app.clickup.com/t/86exq4t46) |
| 7 | ThemeBuilder v2 P2 — Auto-Save + Context Menu | ⬜ to do | normal | [86exq4t5p](https://app.clickup.com/t/86exq4t5p) |
| 8 | **Blok Mimarisi Refaktoru — her blok ayrı component dosyası** | ⬜ to do | high | [86exxxf42](https://app.clickup.com/t/86exxxf42) |

### ⚠️ Tutarsızlık Notu — Senkronizasyon Gerekli

`docs/TASKS.md` (satır 21–24) Faz 1, 2, 3, 4'ü **tamamlanmış** işaretliyor; ancak ClickUp'ta **Faz 1 ve Faz 3 (grid snapping) hâlâ `to do`**, ayrıca ikinci bir "Faz 3: 12-Kolon Grid" görevi `in progress`. Kod tarafında `section-container`/`grid-row`/`grid-column` blokları ve `json-array` prop tipi mevcut, fakat PRD'deki tam kapsam (modal veri girişi UX'i, snapping kulpları) doğrulanmalı. **Yapılacak:** Faz 1 ve Faz 3'ün gerçek durumu kodda doğrulanıp ClickUp + TASKS.md eşitlenmeli.

---

## 4. Eksikler — PRD Bölüm 7'den Henüz Görevleştirilmemiş Özellikler

Aşağıdaki maddeler [PRD v3.0](PRD/web-builder-ux-grid-nesting-prd.md)'da analiz edilmiş ancak **ClickUp'ta görevi açılmamış** profesyonel builder gereksinimleridir. Webflow/Shopify Plus seviyesi için kritiklik sırasına göre gruplandı:

### 4.1. Kritik (ürünü "profesyonel" yapan çekirdek eksikler)

| PRD | Özellik | Özet |
|---|---|---|
| 7.8 | **Medya Kütüphanesi** | URL girişi yerine Medya Galeri Modali: yüklenen görseller listesi, drag-drop upload, tek tıkla prop'a bağlama. Şu an sadece düz URL girilebiliyor. |
| 7.2 | **Görsel CSS Stil Müfettişi (Box-Model Inspector)** | Padding/margin/border/shadow'un görsel kutu modeli üzerinden serbest düzenlenmesi (şu an kısıtlı Select seçenekleri var). |
| 7.17 | **Cihaz Bazlı Stil Ezme (Viewport Style Overrides)** | Desktop/mobil için ayrı padding, font-size, hizalama + Responsive Visibility (cihazda gizle). |
| 7.5 | **Çoklu Dil Desteği (Localized Props)** | `WIXI_LANGUAGES` entegrasyonu; text prop'larının `{"tr-TR": "...", "en-US": "..."}` formatında saklanması + üst barda dil switcher. |
| 7.20 | **Editor Canvas'ta Canlı DB Önizleme** | `featured-products`, `categories-grid`, `faq` vb. blokların editörde gri iskelet yerine gerçek tenant verisiyle render edilmesi (storefront'ta var, editörde yok — WYSIWYG kopukluğu). |
| 7.10 | **Iframe Sandbox Canvas** | Custom HTML/JS hatalarının editörü çökertmemesi için canvas'ın izole `<iframe>` + postMessage mimarisine taşınması. |

### 4.2. Yüksek Değer (dönüşüm ve içerik üretimi)

| PRD | Özellik | Özet |
|---|---|---|
| 7.4 | **Hazır Şablon Enjeksiyonu (Layout Presets)** | "Modern İletişim Sayfası", "Hero + Üçlü Kategori" gibi tek tıkla eklenen hazır bölüm/sayfa şablonları. |
| 7.23 | **Sayfa Kopyalama & Özel Şablonlar** | "Sayfayı Kopyala" + "Şablon Olarak Kaydet" aksiyonları. |
| 7.11 | **Global Bloklar (Synced Sections)** | Bir bölümü global yapma; bir yerde güncellenince tüm sayfalarda otomatik güncellenme. |
| 7.15 | **Dinamik Form Tasarımcısı** | `contact-form` sabit alanlarının ötesinde alan ekle/çıkar (text, dropdown, file upload) + hedef seçimi (e-posta / DB / webhook). Backend `WixiWebForm` altyapısı hazır, builder UI'ı eksik. |
| 7.16 | **Eylem Yöneticisi (Action Manager)** | Buton tıklamasına Link / Anchor Scroll / Open Modal / Pixel-GTM event atanması. |
| 7.12 | **Scroll Animasyon Yöneticisi** | Bileşen bazında fade/slide/zoom giriş efekti + duration/delay; Intersection Observer ile tetikleme. |
| 7.9 | **Hover/Focus Durum Stilleri** | Properties'e State Selector (Normal / Hover / Focus) eklenmesi. |
| 7.6 | **Dark / Light Mode Önizleme** | Canvas'ta tema modu switch'i; `ThemeConfig`'te `colors.dark` + `colors.light`. |

### 4.3. SEO & Performans

| PRD | Özellik | Özet |
|---|---|---|
| 7.13 | **SEO Snippet Önizleme Kartları** | Google arama sonucu + OpenGraph sosyal kart canlı önizlemesi (SeoPanel'e eklenecek). |
| 7.21 | **Otomatik JSON-LD Üretici** | FAQ bloğu → `FAQPage` şeması, ürün blokları → `Product` şeması otomatik `<head>` enjeksiyonu. |
| 7.22 | **SSR Uyumlu CSS Derleyici** | Kaydetme anında tüm blokların `toCss()` çıktısının backend'de tek minified CSS dosyasına derlenmesi + Redis cache (Lighthouse 100 hedefi). `toCss()` altyapısı blockRegistry'de hazır. |

### 4.4. Kurumsal / Çoklu Kullanıcı

| PRD | Özellik | Özet |
|---|---|---|
| 7.14 | **Eşzamanlı Düzenleme Kilidi** | Sayfa açıkken DB/Redis lock; ikinci kullanıcıya salt-okunur mod uyarısı (şu an veri kaybı riski VAR). |
| 7.3 | **Görsel Tarihçe Günlüğü** | Oturum içi aksiyon listesi ("SSS Bloğu Eklendi" vb.) + adıma tıklayıp geri dönme. |
| 7.1 | **Dinamik Veri Bağlama (CMS Binding)** | Prop'lara `{{CMS.CorpBlog.Latest.Title}}` / `{{Product.Price}}` bağlama; ComboBox ile şema seçimi. |
| 7.18 | **A/B Split Testing** | Tek slug için Varyasyon A/B, 50/50 dağıtım, dönüşüm analizi. |

### 4.5. AI & Monetizasyon (Faz 5–6 kapsamı, görevleri açık)

- **AI Sayfa Üretimi:** LLM'in HTML değil, `BLOCK_REGISTRY` şemasına uygun **JSON ağacı** üretmesi → %100 hatasız sayfalar. ([86exrevrh](https://app.clickup.com/t/86exrevrh))
- **Kredi Sistemi:** `WIXI_TENANT_CREDITS` + `WIXI_CREDIT_LOGS`; tam sayfa 10 kredi, tekil blok 1, görsel üretimi 2 kredi; Stripe planına dahil aylık kredi.
- **Şablon Pazarı:** `WIXI_SECTION_TEMPLATES`, Share Code (`WIX-HTML-7A9D`), DOMPurify sanitization. ([86exrevrr](https://app.clickup.com/t/86exrevrr))

---

## 5. Kod Tabanından Tespit Edilen Ek Teknik Eksikler

PRD'de olmayan, inceleme sırasında görülen maddeler:

0. **Monolitik blok mimarisi (görevi açıldı → [86exxxf42](https://app.clickup.com/t/86exxxf42)):** 38 bloğun şemaları tek dosyada (`blockRegistry.ts`, 1.607 satır), render'ları `EditorCanvas.tsx` içindeki tek `MiniRenderer` switch-case'inde (38 case). Hedef: her blok kendi klasöründe (`blocks/Hero/Hero.schema.ts` + `Hero.tsx`), registry ve renderer lookup-map üzerinden toplanır; mevcut export API'si korunarak panellerde değişiklik gerektirmez. Tek bloğa izole müdahale, kolay yeni blok ekleme ve Faz 5–6 (AI / Marketplace) için ön koşul.
1. **WebBuilder ↔ ThemeBuilder panel paylaşımının sınırları:** `WebBuilderEditor` ThemeBuilder panellerini import ediyor; ancak `DesignPanel` (WebBuilder) ile `ThemePanel` (ThemeBuilder) ayrışmış durumda. Tema değişkenleri (renk paleti, tipografi) kurumsal tarafta tam yönetilemiyor — ortak bir `ThemeConfig` editör katmanı gerekli.
2. **CorpSettings command/query'lerinde handler klasör standardı:** `UpdateCorpSettingsCommand.cs` ve `GetCorpSettingsQuery.cs` tek dosyada — modül iç yapı standardına (`Commands/<Action>/` + Handler ayrı dosya) uyumlu hale getirilmeli.
3. **Form submission spam koruması yok:** `SubmitWebForm` endpoint'inde rate limit / honeypot / captcha görünmüyor — public endpoint olduğu için öncelikli güvenlik eksiği.
4. **Blog tarafında builder entegrasyonu yok:** Blog post içeriği builder layout'u ile değil düz içerikle yönetiliyor; `blog-list` bloğu var ama blog detay sayfası şablonu builder'dan tasarlanamıyor.
5. **`docs/TASKS.md` ↔ ClickUp senkron süreci tanımsız:** İki kaynak birbirinden bağımsız güncelleniyor (bkz. §3 tutarsızlık notu).

---

## 6. Önerilen Yol Haritası (Sprint Eşlemesi)

Mevcut sprint takvimi (CLAUDE.md) ve açık görevlerle hizalanmış öncelik sırası:

### Aşama A — Devam Eden İşi Bitir (mevcut sprint)
1. ✅→🔵 **12-Kolon Dinamik Grid Sistemi** ([86exrf0t4](https://app.clickup.com/t/86exrf0t4) — in progress) — resize kulpları + snapping ile birlikte Faz 3'ü ([86exrevr2](https://app.clickup.com/t/86exrevr2)) kapat.
2. **Faz 1 Modal Veri Girişi** ([86exrevqp](https://app.clickup.com/t/86exrevqp)) — durumu kodda doğrula; eksikse tamamla (Quick Win).
3. **DnD yeniden sıralama** ([86exq4t46](https://app.clickup.com/t/86exq4t46)) + **Auto-Save & Context Menu** ([86exq4t5p](https://app.clickup.com/t/86exq4t5p)).
4. **Blok Mimarisi Refaktoru** ([86exxxf42](https://app.clickup.com/t/86exxxf42)) — her blok ayrı component klasörüne ayrılır; **Faz 3 grid işi merge edildikten hemen sonra** yapılmalı (aynı dosyalara dokunuyor), Aşama B'deki tüm blok geliştirmelerinin zeminini hazırlar.

### Aşama B — Profesyonel Çekirdek (1–2 sprint)
4. Medya Kütüphanesi (7.8) — tüm görsel prop'ların önünü açar.
5. Görsel CSS Stil Müfettişi (7.2) + Viewport Style Overrides (7.17).
6. Canvas'ta Canlı DB Önizleme (7.20) — WYSIWYG bütünlüğü.
7. Eşzamanlı Düzenleme Kilidi (7.14) — **veri kaybı riski nedeniyle öne alınmalı.**
8. SubmitWebForm spam koruması (§5.3).

### Aşama C — İçerik Hızlandırıcılar (1–2 sprint)
9. Layout Presets (7.4) + Sayfa Kopyalama/Şablon (7.23).
10. Global Bloklar (7.11).
11. Dinamik Form Tasarımcısı (7.15) + Action Manager (7.16).
12. Scroll Animasyonları (7.12) + Hover/Focus stilleri (7.9) + Dark/Light önizleme (7.6).

### Aşama D — SEO, Performans, Çoklu Dil (1 sprint)
13. Çoklu Dil Localized Props (7.5).
14. SEO Snippet Önizleme (7.13) + Otomatik JSON-LD (7.21).
15. SSR CSS Derleyici (7.22) + Iframe Sandbox (7.10).

### Aşama E — AI & Marketplace (Faz 5–6)
16. AI JSON üretimi + kredi modeli ([86exrevrh](https://app.clickup.com/t/86exrevrh)).
17. Şablon Pazarı + Share Code + DOMPurify ([86exrevrr](https://app.clickup.com/t/86exrevrr)).
18. A/B Testing (7.18) + CMS Data Binding (7.1) + Görsel Tarihçe (7.3).

> **Not:** Aşama B–E'deki PRD maddeleri için ClickUp'ta henüz görev yok. Çalışmaya başlanmadan önce her madde **Store Admin listesine (`901818217840`)** ana görev [86exrevqk](https://app.clickup.com/t/86exrevqk) altına subtask olarak açılmalıdır (CLAUDE.md görev yaşam döngüsü kuralı).

---

## 7. Etkilenecek Ana Dosyalar (Referans)

| Alan | Dosya |
|---|---|
| Blok şemaları | `src/frontend/src/features/ThemeBuilder/blocks/blockRegistry.ts` |
| Reducer / state | `src/frontend/src/features/ThemeBuilder/context/EditorContext.tsx` |
| Canvas & DnD | `src/frontend/src/features/ThemeBuilder/canvas/EditorCanvas.tsx` |
| Properties / Inspect | `src/frontend/src/features/ThemeBuilder/panels/PropertiesPanel.tsx` |
| Katman ağacı | `src/frontend/src/features/ThemeBuilder/panels/LayersPanel.tsx` |
| Kurumsal editör shell | `src/frontend/src/features/WebBuilder/WebBuilderEditor.tsx` |
| Layout tipi | `src/frontend/src/entities/StorePage/model/types.ts` (`LayoutComponent.children`) |
| Kurumsal sayfa API | `Wixi.Modules.WebBuilder/Application/CorpPages/**` |
| Form altyapısı | `Wixi.Modules.WebBuilder/Application/Forms/**` |
| Provisioning | `Wixi.Modules.WebBuilder/Infrastructure/Services/WebBuilderTenantProvisioner.cs` |
