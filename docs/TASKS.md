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
- [ ] Faz 2: Kapsayıcı Katmanlar & Nested Layout Mimarisi
- [ ] Faz 3: Izgara Yapışma (Grid Snapping) & Sürükleme Kılavuzları
- [ ] Faz 4: Viewport Duyarlılık Çözümü & Premium Efektler
- [ ] Faz 5: İleri Seviye AI Entegrasyonu & SaaS Kredi Modeli
- [ ] Faz 6: Custom HTML Şablon Pazarı (Marketplace & Presets)

