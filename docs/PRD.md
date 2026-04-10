# WIXI MULTI-APP PLATFORM - ÜRÜN GEREKSİNİMLERİ DOKÜMANI (PRD)

## 1. Projenin Vizyonu
WIXI uygulaması, gelecekte birbirinden farklı modüllerin (Randevu, Finans, İK/Tekstil, CV Oluşturucu vb.) birleşerek çalıştığı, kurumsal seviyede genişleyebilir (scalable), "Sök-Tak (Pluggable)" mantığında çalışan güçlü bir Multi-App Platform (SaaS) sistemidir.  
Mevcut kod tabanımız aceleyle MVP (Minimum Viable Product) prensibi ile yazıldığından, projenin ileriye dönük yükünü taşıması amacıyla altyapısı kurumsal bir N-Tier (Modular Monolith) ve Frontend için FSD mimarisine çevirilmektedir.

## 2. Temel Mimari Kararları
- **Backend:** `ASP.NET Core 8/9`, SQL Server, Entity Framework Core. Modüller arası iletişim In-Memory Bus/CQRS (MediatR) kullanılarak izole edilecek ve bir "Modular Monolith" iskeleti kullanılacaktır. Tüm tablolar standartlaşma amacıyla `WIXI_` önekiyle başlayacaktır.
- **Frontend:** `React 19`, `Vite`, `Tailwind CSS`, `Shadcn UI`. Mimari dizayn olarak "Feature-Sliced Design (FSD)" yaklaşımı uygulanacak olup, bileşenlerin tamamen özelliklerine / iş mantıklarına göre katmanlandırıldığı modüler yapı hedeflenecektir.
- **İletişim/Entegrasyon:** Güvenli JWT/Refresh tabanlı session yönetimi ve API Versioning (Örn: /api/v1/...) uygulanacaktır.

## 3. Temel Sistem Modülleri (Core Features)
Her yeni eklenmek istenen "Aplikasyon", bu çekirdek modüllerin sağladığı servisleri kullanarak çalışacaktır.
1. **Güçlü Yetkilendirme (Auth & Session):** JWT, Cihaz oturum kontrolü, Katı parola politikaları.
2. **Rol & Yetki Sistemi (Dynamic RBAC):** Yetkilerin ve sol menü (Sidebar) elemanlarının statik bir JSON dosyasından değil, Veritabanından yönetildiği dinamik altyapı.
3. **Merkezi Loglama:** Hataların ve Audit loglarının bir merkezden veritabanına ve external sink'lere kaydı (Örn: Hangi id'li rol, nerede, kimi sildi).
4. **Workspace / File / Notes Altyapısı:** Tüm modüllerin ortak kullanacağı yardımcı bileşenler.

## 4. Kullanıcı Personaları
- **SuperAdmin:** Tüm WIXI platformunun hakimi. Modülleri atar, menüleri kurgular.
- **Client (Müşteri):** Platforma üye olup, izin verilen sınırlı modülleri tüketen (örn. kendi randevusu) uç kullanıcı.
- **Employee/Manager:** Kendi departmanıyla ilgili (örneğin tekstil modülü) yetkili ekranları kullanan şirket personeli.

## 5. Proje Hedef Metrikleri
- **Bakım Kolaylığı (Maintainability):** FSD yaklaşımı sayesinde yeni bir geliştirici projeye dahil olduğunda, özellik aramak için projenin her yerine bakmak zorunda kalmamalı, doğrudan ilgili feature klasörüne girebilmeli.
- **Modülerlik (Modularity):** Backend'deki X modülü çöktüğünde bile, çekirdek yapının ayakta kalarak diğer alanların işlevine devam etmesi.
- **Kod Standartları:** Bütün Error handling ve toast bildirimleri global kurallara (`.agent/rules`) bağlı kalacak. Magic string'ler kullanılmayacak.
