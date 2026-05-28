# Wixi SaaS Onboarding & Ödeme Entegrasyonu - Görev Listesi

- [x] Faz 1: Backend Ortak Ödeme & Onboarding Altyapısı
  - [x] `Wixi.Shared` projesine `Iyzipay` NuGet paketinin eklenmesi ve `IyzipayOptions`, `IyzipayService` sınıflarının taşınması
  - [x] `Wixi.Modules.ECommerce` altından eski İyzico dosyalarının silinmesi ve referansların güncellenmesi
  - [x] `Wixi.API/Program.cs` üzerinde `Iyzipay` servisinin global DI kaydı
  - [x] `SaasOnboardingController.cs`'in şifre kabul etmesi, JWT token dönmesi ve `requiresPayment` flag desteği
  - [x] `SaasSubscriptionController.cs` içerisine İyzico ödeme başlatma ve callback endpoint'lerinin eklenmesi
- [x] Faz 2: Frontend Route ve Sayfa Entegrasyonu
  - [x] `App.tsx` içerisine yeni route'ların tanımlanması (`/verify-email`, `/onboarding`, `/select-plan`, `/checkout/saas`)
  - [x] `RegisterPage.tsx`'in `wixi/app/kayit.html` şablonuna göre güncellenmesi
  - [x] `VerificationPage.tsx` (E-posta doğrulama) ekranının `wixi/app/dogrulama.html` şablonuna göre yazılması
  - [x] `OnboardingPage.tsx` (Kurulum Sihirbazı) ekranının `wixi/app/onboarding.html` şablonuna göre yazılması
  - [x] `PlanSelectionPage.tsx` (Plan Seçimi) ekranının `wixi/app/plan-sec.html` şablonuna göre yazılması
  - [x] `SaaSCheckoutPage.tsx` (SaaS Ödeme) ekranının `wixi/app/odeme.html` şablonuna göre yazılması
  - [x] `CheckoutSuccessPage.tsx` (Ödeme Başarılı) ekranının `wixi/app/odeme-basarili.html` şablonuna göre güncellenmesi
- [ ] Faz 3: Test & Doğrulama (Kullanıcı tarafından gerçekleştirilecektir)

# Wixi Web Builder UX, Grid & Nesting - Görev Listesi

- [x] Faz 1: Şema Tabanlı Modal Veri Girişi Entegrasyonu (Quick Win)
- [x] Faz 2: Kapsayıcı Katmanlar & Nested Layout Mimarisi
- [x] Faz 3: Izgara Yapışma (Grid Snapping) & Sürükleme Kılavuzları
- [x] Faz 4: Viewport Duyarlılık Çözümü & Premium Efektler
- [ ] Faz 5: İleri Seviye AI Entegrasyonu & SaaS Kredi Modeli
- [ ] Faz 6: Custom HTML Şablon Pazarı (Marketplace & Presets)

# Wixi Editor Canvas UX İyileştirmeleri - Görev Listesi

- [x] Katmanlar Paneli: Satır/Kolon/Bileşen için yukarı/aşağı taşı, kolon ekle, gizle, kilitle, sil işlemleri
- [x] `LayoutRowProps` ve `LayoutColumn` tiplerine `isHidden`/`isLocked` alanları eklendi
- [x] `EditorContext.tsx`: `TOGGLE_HIDE_NODE`, `TOGGLE_LOCK_NODE`, `MOVE_ROW`, `MOVE_COLUMN`, `MOVE_COMPONENT`, `ADD_COLUMN_TO_ROW`, `DELETE_COLUMN` reducer aksiyonları
- [x] `EditorCanvas.tsx`: Kilitli satırlar drag'i engeller, gizli satırlar transparent+dashed görünür
- [x] Navbar & Footer canvas'ta seçilince `PropertiesPanel`'da inline düzenleme paneli açılır
- [x] `NavbarPropertiesPanel`: layout, logo, menü linkleri, sticky/search/dil seçici toggle
- [x] `FooterPropertiesPanel`: kolon sayısı, telif metni, sosyal ikonlar, kolon linkleri
- [x] `DesignPanel.tsx`: Global section seçilince bilgilendirme placeholder
- [x] TypeScript typecheck: 0 hata

# Wixi Yönlendirme & Yetki Düzeltmeleri - Görev Listesi
- [x] TenantAdmin için Bölge Yönetimi ve Form Yönetimi route'larının /tenant/:tenantSlug altına taşınması
- [x] SeedData.cs içerisinde ilgili menülerin tenant-scoped path'lere güncellenmesi
- [x] RegionsController.cs API'sinde TenantAdmin rolünün yetkilendirilmesi
- [x] Değişikliklerin frontend ve backend üzerinde doğrulanması

# Wixi Bağımsız Tema Editörü & Müşteri Kartı - Görev Listesi
- [x] Tema Editörü'nün `/corp/theme-editor/:tenantSlug` bağımsız route'una taşınması ve App.tsx üzerinde tanımlanması
- [x] Menü ve dashboard quick-action yönlendirmelerinin yeni bağımsız route'a güncellenmesi
- [x] SeedData.cs ve ModuleController.cs seed kodlarındaki tema editörü yollarının `/corp/theme-editor/{tenantSlug}` olarak güncellenmesi
- [x] Tema Editörü (ThemeEditor.tsx) ve Web Builder (WebBuilderEditor.tsx) üst barlarına müşteri/mağaza ismi kartının (tenant badge) eklenmesi
- [x] Tema ve badge stillerinin ThemeEditor.module.css üzerinde premium olarak tasarlanması
- [/] Değişikliklerin frontend ve backend üzerinde doğrulanması
