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
- `[/]` **Frontend:** Base Axios config ve Vanilla CSS (Glassmorphism) temel framework'ünün `shared` katmanına yerleştirilmesi.
- `[ ]` **Frontend:** `entities/User` altında global state (Zustand veya Context) tasarımının yapılması.
- `[ ]` **Frontend:** `features/Auth` altında Login Form bileşeninin yazılması ve API'ye bağlanması.
- `[ ]` **Frontend:** `pages/LoginPage` ve `pages/DashboardPage` router entegrasyonu, Auth Guard (korumalı route) ile test.

---

## 🔐 FAZ 2: Dinamik Menü ve Üst Düzey Rol Sistemi (RBAC)
*Amacımız; admin panelinin sol barını ve ekran yetkilerini hard-coded olmaktan çıkarıp DB ve rollere göre dinamik getirmektir.*

- `[ ]` **Backend:** `WIXI_MENUS` ve `WIXI_ROLE_MENU_PERMISSIONS` tablolarının tasarlanması.
- `[ ]` **Backend:** Kullanıcının tokeninden rollerini okuyup ona gecerli menuleri JSON agacı olarak donen API endpoint'inin (MediatR query) yazılması.
- `[ ]` **Frontend:** `widgets/AdminSidebar` bileşeninin tasarlanması. Menüyü API'den recursive (iç içe alt menüler) şekilde render etmesi.
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
- `[ ]` **Frontend:** Tablolar için Generic Data-Table (Sorting, Pagination, Filtering) bileşeni kodlanması.
- `[ ]` **Frontend:** Lighthouse performans testi ve Bundle-size (dosya küçültme/lazy load) operasyonlarının tamamlanması.
