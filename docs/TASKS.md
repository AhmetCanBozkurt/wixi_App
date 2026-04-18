# WIXI Sistem Yenileme - Otonom Görev Takip Listesi

Buradaki görevler otonom asistan (Antigravity) tarafından projenin fazlarına göre güncellenecektir. İşaretlemeler:
- `[ ]` Yapılacak
- `[/]` Devam Ediyor
- `[x]` Tamamlandı

> [!NOTE]
> Proje takibi artık **Linear** ile senkronize edilmektedir. Görevlerin detaylarına Linear linklerinden ulaşabilirsiniz.

---

## 🚀 FAZ 1: Çekirdek Altyapı ve Kimlik Doğrulama Döngüsü (Auth Cycle)
*Amacımız; sistemin temellerini atmak, DB bağlantılarını sağlamak ve bir kullanıcının sorunsuzca sisteme giriş/çıkış yapmasını garantilemektir.*

- `[x]` **Backend:** `WixiDbContext` dosyasının analizi ve WIXI_USERS, WIXI_ROLES tablolarının ana hatlarıyla kurumsal şemaya (Audit field'lar vs.) oturtulması. [[WIX-9](https://linear.app/wixisoftware/issue/WIX-9/faz-1-db-sema-analizi-ve-audit-entegrasyonu)]
- `[x]` **Backend:** Veritabanı (SQL Server) migration'ının oluşturulması, temel DB bağlantılarının test edilmesi ve Default Admin kullanıcısı (Seed Data) yaratılması. [[WIX-10](https://linear.app/wixisoftware/issue/WIX-10/faz-1-migration-ve-seed-data-olusturma)]
- `[x]` **Backend:** `Program.cs` içerisindeki hardcoded bağımlılıkların temizlenmesi ve Login / Register API endpoint'lerinin (CQRS/MediatR mantığıyla) netleştirilmesi. [[WIX-11](https://linear.app/wixisoftware/issue/WIX-11/faz-1-backend-bagimlilik-temizligi-ve-cqrs-entegrasyonu)]
- `[x]` **Frontend:** FSD (Feature-Sliced Design) klasör hiyerarşisinin `src/` altına oluşturulması. [[WIX-12](https://linear.app/wixisoftware/issue/WIX-12/faz-1-frontend-fsd-mimari-kurulumu)]
- `[x]` **Frontend:** Base Axios config ve Vanilla CSS (Glassmorphism) temel framework'ünün `shared` katmanına yerleştirilmesi. [[WIX-13](https://linear.app/wixisoftware/issue/WIX-13/faz-1-base-axios-ve-glassmorphism-ui-framework)]
- `[x]` **Frontend:** `entities/User` altında global state (Zustand veya Context) tasarımının yapılması. [[WIX-14](https://linear.app/wixisoftware/issue/WIX-14/faz-1-global-user-state-yonetimi-zustand)]
- `[x]` **Frontend:** `features/Auth` altında Login Form bileşeninin yazılması ve API'ye bağlanması. [[WIX-15](https://linear.app/wixisoftware/issue/WIX-15/faz-1-login-form-ve-auth-entegrasyonu)]
- `[x]` **Frontend:** `pages/LoginPage` ve `pages/DashboardPage` router entegrasyonu, Auth Guard (korumalı route) ile test. [[WIX-16](https://linear.app/wixisoftware/issue/WIX-16/faz-1-router-entegrasyonu-ve-auth-guard-kurulumu)]

---

## 🔐 FAZ 2: Gelişmiş Loglama, Dinamik Menü ve UI Taşıma (Migration)
*Amacımız; giriş/çıkış Audit loglarını (IP, Tarayıcı ile) sisteme kazandırmak ve eski projedeki Admin Layout (Sidebar) & DataTable bileşenlerini yepyeni Vanilla CSS kurallarıyla FSD mimarisine taşımaktır.*

- `[x]` **Backend:** `WixiAuditLog` tablosunun modellenerek Login/Logout (Auth) evrelerine eklenmesi (Müşteri detaylı loglama/IP vs.). [[WIX-17](https://linear.app/wixisoftware/issue/WIX-17/faz-2-audit-log-altyapisi-ve-entegrasyonu)]
- `[x]` **Frontend:** Eski projedeki `AdvancedDataTable.tsx` yapısının alınarak `shared/ui` katmanında CQRS formatına uyumlu Premium Glassmorphism olarak refactor edilmesi. [[WIX-18](https://linear.app/wixisoftware/issue/WIX-18/faz-2-advanceddatatable-refaktoru-premium-glassmorphism)]
- `[x]` **Frontend:** Eski projedeki `AdminLayout.tsx` yapısının (Sidebar ve Header) Tailwind'den temizlenerek `widgets/Sidebar` ve `widgets/Header` dizinlerinde Vanilla CSS modülleriyle canlandırılması. [[WIX-19](https://linear.app/wixisoftware/issue/WIX-19/faz-2-adminlayout-sidebarheader-vanilla-css-donusumu)]
- `[x]` **Backend:** `WIXI_MENUS`, `WIXI_LANGUAGES` ve `WIXI_MENU_TRANSLATIONS` tablolarının tasarlanması ve CRUD uçlarının yazılması. [[WIX-20](https://linear.app/wixisoftware/issue/WIX-20/faz-2-menu-ve-dil-yonetimi-db-tasarimi-crud-api)]
- `[x]` **Frontend:** Menü Yönetim Sayfası, İkon Seçici ve Akıllı Sayfa Seçici (Path Picker) entegrasyonu. [[WIX-21](https://linear.app/wixisoftware/issue/WIX-21/faz-2-menu-yonetim-sayfasi-ve-ikon-secici-entegrasyonu)]
- `[x]` **Frontend:** Global Dil Seçici (Header) ve Dinamik Menü (Sidebar) entegrasyonu. [[WIX-22](https://linear.app/wixisoftware/issue/WIX-22/faz-2-global-dil-secici-ve-dinamik-sidebar-entegrasyonu)]
- `[x]` **Fullstack:** `@dnd-kit` ile Sürükle-Bırak özellikli Kullanıcı Menü Yönetimi Paneli. [[WIX-23](https://linear.app/wixisoftware/issue/WIX-23/faz-2-surukle-birak-kullanici-menu-yonetimi-paneli)]
- `[ ]` **Frontend:** UI tarafında buton gizleme/gösterme mekanizması için `<HasPermission>` hook'u veya wrapper komponentinin yazılması. [[WIX-24](https://linear.app/wixisoftware/issue/WIX-24/faz-2-haspermission-hook-ve-yetki-kontrolu-altyapisi)]

---

## 🛠️ FAZ 3: Ortak Sistem Servisleri (Core Services)
*Amacımız; diğer tüm modüllerin kullanacağı Loglama, Dosya yükleme ve E-Posta atma gibi standart servisleri projeye entegre etmektir.*

- `[ ]` **Backend:** Kurumsal Loglama altyapısının (Serilog) kurulması, DB Log sink entegrasyonu. [[WIX-25](https://linear.app/wixisoftware/issue/WIX-25/faz-3-serilog-ve-db-log-sink-entegrasyonu)]
- `[ ]` **Backend:** Merkezi Mail Servisi (`WIXI_MAIL_QUEUE`) altyapısının oluşturulması. [[WIX-26](https://linear.app/wixisoftware/issue/WIX-26/faz-3-merkezi-mail-servisi-altyapisi)]
- `[ ]` **Backend:** Merkezi Dosya Servisi (`WIXI_FILES`) - (Azure Blob / S3 veya local storage). [[WIX-27](https://linear.app/wixisoftware/issue/WIX-27/faz-3-merkezi-dosya-servisi-file-storage)]
- `[x]` **Frontend:** Resim yükleme, Cropper ve Drag&Drop bileşenlerinin eklenmesi. [[WIX-28](https://linear.app/wixisoftware/issue/WIX-28/faz-3-imageupload-cropper-ve-draganddrop-ui-bilesenleri)]

---

## 📝 FAZ 4: Notion Benzeri "Notlar ve Dokümanlar" Modülü
*Amacımız; sistemin ilk spesifik plug-in modülünü sıfırdan ve yeni mimariye (DDD/FSD) uygun şekilde inşa etmektir.*

- `[ ]` **Backend:** `wixi.Modules.Notes` projesinin/klasörünün oluşturulması. [[WIX-29](https://linear.app/wixisoftware/issue/WIX-29/faz-4-notes-modul-proje-yapilandirmasi)]
- `[ ]` **Backend:** `WIXI_NOTES` ve `WIXI_NOTE_CONTENT` tablolarının CRUD uçları. [[WIX-30](https://linear.app/wixisoftware/issue/WIX-30/faz-4-notes-db-tasarimi-ve-crud-api)]
- `[ ]` **Frontend:** `@dnd-kit` ve zengin metin editör (block-editor) yapısı. [[WIX-31](https://linear.app/wixisoftware/issue/WIX-31/faz-4-block-editor-ve-noteeditor-gelistirme)]
- `[ ]` **Frontend:** Multi-user okuma engeli/yetkilerinin uygulanması. [[WIX-32](https://linear.app/wixisoftware/issue/WIX-32/faz-4-not-yetkilendirme-ve-canliya-alim)]

---

## 🔄 FAZ 5: Mevcut Büyük Modüllerin Taşınması (Migration)
*Amacımız; eski sistemde (tightly coupled) çalışan büyük modüllerin yeni sisteme güvenlice taşınmasıdır.*

- `[ ]` **Görev:** `wixi.Tekstil` modülünün izole application katmanı haline getirilmesi. [[WIX-33](https://linear.app/wixisoftware/issue/WIX-33/faz-5-tekstil-modul-migrasyonu)]
- `[ ]` **Görev:** `wixi.CVBuilder` yapısının taşınması. [[WIX-34](https://linear.app/wixisoftware/issue/WIX-34/faz-5-cvbuilder-modul-migrasyonu)]
- `[ ]` **Görev:** `wixi.Appointments` (Randevu) yapısının taşınması. [[WIX-35](https://linear.app/wixisoftware/issue/WIX-35/faz-5-appointments-modul-migrasyonu)]
- `[ ]` **Görev:** `wixi.Clients` yapısının Müşteri Portalı olarak izole edilmesi. [[WIX-36](https://linear.app/wixisoftware/issue/WIX-36/faz-5-clients-modul-migrasyonu-musteri-portali)]

---

## 🎨 FAZ 6: Frontend Optimizasyonu ve Dashboard Cila İşlemleri (Polish)
*Amacımız; sistem altyapısı bittikten sonra "Wow Effect" yaratmak ve performansı köklemektir.*

- `[ ]` **Frontend:** Global Dashboard grafik bileşenlerinin (Widget) oluşturulması. [[WIX-37](https://linear.app/wixisoftware/issue/WIX-37/faz-6-global-dashboard-grafik-widget-gelistirme)]
- `[ ]` **Frontend:** Dark / Light tema mantığının kusursuzlaştırılması. [[WIX-38](https://linear.app/wixisoftware/issue/WIX-38/faz-6-dark-light-tema-optimizasyonu)]
- `[x]` **Frontend:** Tablolar için Generic Data-Table (`AdvancedDataTable`) refaktörü. [[WIX-39](https://linear.app/wixisoftware/issue/WIX-39/faz-6-generic-advanceddatatable-refaktoru)]
- `[x]` **Frontend:** Premium UI Design System temelleri ve `ComponentShowcasePage`. [[WIX-40](https://linear.app/wixisoftware/issue/WIX-40/faz-6-premium-ui-design-system-ve-prototype)]
- `[ ]` **Frontend:** Lighthouse performans testi ve Bundle-size operasyonu. [[WIX-41](https://linear.app/wixisoftware/issue/WIX-41/faz-6-lighthouse-ve-performans-optimizasyonu)]
- `[x]` **Backend:** `IAuditable` interface'inin ve veritabanı modellerinin genişletilmesi. [[WIX-42](https://linear.app/wixisoftware/issue/WIX-42/faz-6-iauditable-genisletme-ve-otomatik-user-audit)]
- `[x]` **Frontend:** `AdvancedDataTable` bileşenine standart Audit sütunlarının eklenmesi. [[WIX-43](https://linear.app/wixisoftware/issue/WIX-43/faz-6-datatable-audit-sutunlari-entegrasyonu)]

---

## 🧪 FAZ 7: Test Otomasyonu ve API Standardizasyonu (TestSprite Alignment)
*Amacımız; sistemin tüm API endpoint'lerini ve frontend test senaryolarını modernize edilmiş backend mimarisiyle (%100 başarı oranıyla) uyumlu hale getirmektir.*

- `[x]` **Backend:** API endpoint yollarının ve veri yapılarının standardizasyonu. [[WIX-5](https://linear.app/wixisoftware/issue/WIX-5/standardize-backend-api-for-test-alignment)]
- `[x]` **Fullstack:** Backend ve Frontend `standard_prd.json` hizalanması. [[WIX-6](https://linear.app/wixisoftware/issue/WIX-6/align-prd-and-test-specifications)]
- `[/]` **Frontend:** `testsprite_tests` altındaki Python test scriptlerinin onarılması. [[WIX-7](https://linear.app/wixisoftware/issue/WIX-7/fix-frontend-python-test-scripts)]
- `[ ]` **Verification:** TestSprite üzerinden tüm testlerin koşturulması ve %100 "Passed" sonucu. [[WIX-8](https://linear.app/wixisoftware/issue/WIX-8/final-test-verification-and-success)]
