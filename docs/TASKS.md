# WIXI Sistem Yenileme - Otonom Görev Takip Listesi

Buradaki görevler otonom asistan (Antigravity) tarafından projenin fazlarına göre güncellenecektir. İşaretlemeler:
- `[ ]` Yapılacak
- `[/]` Devam Ediyor
- `[x]` Tamamlandı

---

## 🚀 FAZ 1: Çekirdek Altyapı ve Kimlik Doğrulama Döngüsü (Auth Cycle)
*Amacımız; sistemin temellerini atmak, DB bağlantılarını sağlamak ve bir kullanıcının sorunsuzca sisteme giriş/çıkış yapmasını garantilemektir.*

- `[x]` **Backend:** `WixiDbContext` dosyasının analizi ve WIXI_USERS, WIXI_ROLES tablolarının ana hatlarıyla kurumsal şemaya (Audit field'lar vs.) oturtulması.
- `[x]` **Backend:** Veritabanı (SQL Server) migration'ının oluşturulması, temel DB bağlantılarının test edilmesi ve Default Admin kullanıcısı (Seed Data) yaratılması.
- `[x]` **Backend:** `Program.cs` içerisindeki hardcoded bağımlılıkların temizlenmesi ve Login / Register API endpoint'lerinin (CQRS/MediatR mantığıyla) netleştirilmesi.
- `[x]` **Frontend:** FSD (Feature-Sliced Design) klasör hiyerarşisinin `src/` altına oluşturulması (`app`, `pages`, `widgets`, `features`, `entities`, `shared`).
- `[x]` **Frontend:** Base Axios config ve Vanilla CSS (Glassmorphism) temel framework'ünün `shared` katmanına yerleştirilmesi. (Dinamik Accept-Language eklendi)
- `[x]` **Frontend:** `entities/User` altında global state (Zustand veya Context) tasarımının yapılması.
- `[x]` **Frontend:** `features/Auth` altında Login Form bileşeninin yazılması ve API'ye bağlanması.
- `[x]` **Frontend:** `pages/LoginPage` ve `pages/DashboardPage` router entegrasyonu, Auth Guard (korumalı route) ile test.

---

## 🔐 FAZ 2: Gelişmiş Loglama, Dinamik Menü ve UI Taşıma (Migration)
*Amacımız; giriş/çıkış Audit loglarını (IP, Tarayıcı ile) sisteme kazandırmak ve eski projedeki Admin Layout (Sidebar) & DataTable bileşenlerini yepyeni Vanilla CSS kurallarıyla FSD mimarisine taşımaktır.*

- `[ ]` **Backend:** `WixiAuditLog` tablosunun modellenerek Login/Logout (Auth) evrelerine eklenmesi (Müşteri detaylı loglama/IP vs.).
- `[x]` **Frontend:** Eski projedeki `AdvancedDataTable.tsx` yapısının alınarak `shared/ui` katmanında CQRS formatına uyumlu Premium Glassmorphism olarak refactor edilmesi.
- `[x]` **Frontend:** Eski projedeki `AdminLayout.tsx` yapısının (Sidebar ve Header) Tailwind'den temizlenerek `widgets/Sidebar` ve `widgets/Header` dizinlerinde Vanilla CSS modülleriyle canlandırılması.
- `[x]` **Backend:** `WIXI_MENUS`, `WIXI_LANGUAGES` ve `WIXI_MENU_TRANSLATIONS` tablolarının tasarlanması ve CRUD uçlarının yazılması.
- `[x]` **Frontend:** Menü Yönetim Sayfası, İkon Seçici ve Akıllı Sayfa Seçici (Path Picker) entegrasyonu.
- `[x]` **Frontend:** Global Dil Seçici (Header) ve Dinamik Menü (Sidebar) entegrasyonu.
- `[x]` **Fullstack:** `@dnd-kit` ile Sürükle-Bırak özellikli Kullanıcı Menü Yönetimi Paneli (`UserManagementPage` & `WixiUserMenu`) geliştirildi. (Step-by-step logic: User Info + Menu Builder added).
- `[ ]` **Frontend:** UI tarafında buton gizleme/gösterme mekanizması için `<HasPermission>` hook'u veya wrapper komponentinin yazılması.

---

## 🛠️ FAZ 3: Ortak Sistem Servisleri (Core Services)
*Amacımız; diğer tüm modüllerin kullanacağı Loglama, Dosya yükleme ve E-Posta atma gibi standart servisleri projeye entegre etmektir.*

- `[ ]` **Backend:** Kurumsal Loglama altyapısının (Serilog) kurulması, DB Log (WIXI_LOGS) sink entegrasyonu.
- `[ ]` **Backend:** Merkezi Mail Servisi (`WIXI_MAIL_QUEUE`) altyapısının oluşturulması (Template desteği ve async retry mantığı).
- `[ ]` **Backend:** Merkezi Dosya Servisi (`WIXI_FILES`) - (Azure Blob / S3 veya local storage desteği ve guid base file mapper).
- `[ ]` **Frontend:** Resim yükleme, Cropper (kesme) ve Drag&Drop (Dropzone) bileşenlerinin `shared/ui` katmanına generic bir şekilde eklenmesi.

---

## 📝 FAZ 4: Notion Benzeri "Notlar ve Dokümanlar" Modülü
*Amacımız; sistemin ilk spesifik plug-in modülünü sıfırdan ve yeni mimariye (DDD/FSD) uygun şekilde inşa etmektir.*

- `[ ]` **Backend:** `wixi.Modules.Notes` projesinin/klasörünün oluşturulması. Kendi Interface'leri ve MediatR handler'larının ayarlanması.
- `[ ]` **Backend:** `WIXI_NOTES` ve `WIXI_NOTE_CONTENT` tablolarının tasarlanıp, CRUD uçlarının yazılması.
- `[ ]` **Frontend:** `@dnd-kit` ve zengin metin editör (block-editor) yapısının `features/NoteEditor` olarak kodlanması.
- `[ ]` **Frontend:** Multi-user okuma engeli/yetkilerinin uygulanarak sayfanın canlıya alınması.

---

## 🔄 FAZ 5: Mevcut Büyük Modüllerin Taşınması (Migration)
*Amacımız; eski sistemde (tightly coupled) çalışan büyük modüllerin yeni sisteme güvenlice taşınmasıdır.*

- `[ ]` **Görev:** `wixi.Tekstil` modülünün izole application katmanı haline getirilmesi ve frontend'inin `features` klasörlerine dağıtılması.
- `[ ]` **Görev:** `wixi.CVBuilder` yapısının taşınması.
- `[ ]` **Görev:** `wixi.Appointments` (Randevu) yapısının taşınması.
- `[ ]` **Görev:** `wixi.Clients` yapısının Müşteri Portalı/Admin portali olarak izole edilmesi.

---

## 🎨 FAZ 6: Frontend Optimizasyonu ve Dashboard Cila İşlemleri (Polish)
*Amacımız; sistem altyapısı bittikten sonra "Wow Effect" (kullanıcıyı şaşırtacak premium UI) yaratmak ve performansı köklemektir.*

- `[ ]` **Frontend:** Recharts veya ApexCharts ile Global Dashboard grafik bileşenlerinin (Widget) oluşturulması.
- `[ ]` **Frontend:** Dark / Light tema mantığının (Shadcn Theme Provider üzerinden) kusursuzlaştırılması.
- `[x]` **Frontend:** Tablolar için Generic Data-Table (`AdvancedDataTable`) bileşeni Premium Vanilla CSS olarak refactor edildi.
- `[x]` **Frontend:** Premium UI Design System temelleri atıldı (Button, Input, Card) ve `ComponentShowcasePage` oluşturuldu.
- `[ ]` **Frontend:** Lighthouse performans testi ve Bundle-size (dosya küçültme/lazy load) operasyonlarının tamamlanması.
