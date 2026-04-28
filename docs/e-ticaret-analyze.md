# 🚀 SaaS E-Ticaret Platformu (IKAS Benzeri) – Master Prompt

Sen deneyimli bir yazılım mimarı ve SaaS ürün geliştiricisisin.
Görevin, aşağıdaki gereksinimlere uygun **modüler, ölçeklenebilir, production-ready bir e-ticaret platformu** tasarlamak.

---

## 🎯 PROJE HEDEFİ

* IKAS benzeri bir **multi-tenant e-ticaret SaaS platformu**
* Her müşteri kendi mağazasını açabilmeli
* Admin panel + Storefront (müşteri sitesi) olacak
* SEO uyumlu, hızlı, ölçeklenebilir sistem

---

## 🧱 MİMARİ GEREKSİNİMLER

### Genel Mimari:

* Multi-tenant yapı (database-per-tenant veya tenantId bazlı)
* Modüler monolith veya microservice mimarisi
* Event-driven sistem (RabbitMQ veya Kafka)
* API-first yaklaşım
* Clean Architecture / DDD yaklaşımı

---

## ⚙️ TEKNOLOJİ STACK

### Backend:

* .NET Core (tercihen .NET 8)
* Entity Framework Core
* PostgreSQL veya MSSQL
* Redis (cache)
* RabbitMQ (event bus)
* Hangfire (background jobs)
* JWT / OAuth authentication

### Frontend:

* Storefront: Next.js (SSR + SEO)
* Admin Panel: React (Vite veya Next.js)
* TailwindCSS

---

## 🧩 MODÜLLER

Aşağıdaki modülleri detaylı şekilde tasarla:

### Core:

* Product Management (variant, stock, media)
* Category & Brand
* Inventory Management
* Cart & Checkout
* Order Management
* Customer Management

### Payment:

* Iyzico / PayTR / Stripe adapter yapısı
* 3D Secure flow
* Callback/Webhook handling

### Invoice (E-Fatura / E-Arşiv):

* UBL XML üretimi
* Entegratör adapter yapısı (Uyumsoft, Kolaysoft vb.)
* Fatura gönderim, durum sorgu, iptal
* Multi-tenant entegratör ayarları
* Queue-based gönderim (retry mekanizması)

### Shipping (Kargo):

* Strategy Pattern ile kargo adapter yapısı
* (Yurtiçi, Aras, MNG, Hepsijet vb.)
* Shipment oluşturma
* Etiket (ZPL / PDF) alma
* Tracking sistemi
* Toplu gönderi (bulk shipment)

### SEO:

* SSR rendering
* Dynamic meta tags
* Sitemap & robots.txt
* JSON-LD schema (product, breadcrumb)

### Builder (Page Builder):

* JSON schema ile sayfa oluşturma
* React component mapping
* Drag & drop mantığı

---

## 🔄 WORKFLOW TASARIMI

Aşağıdaki akışları event-driven olarak tasarla:

1. Order Created
2. Payment Completed
3. Invoice Generated
4. Shipment Created
5. Delivery Completed

Her adım:

* Event publish etmeli
* Retry mekanizması olmalı
* Loglanmalı

---

## 📦 KARGO SİSTEMİ DETAYI

* ICargoProvider interface oluştur
* Her kargo firması için adapter yaz
* Etiket formatlarını normalize et (ZPL → PDF opsiyonu)
* Print sistemi öner (PrintNode vs.)

---

## 🧾 E-FATURA DETAYI

* UBL 2.1 XML oluşturma yapısı
* Entegratör bağımsız abstraction layer
* Test ve production environment yönetimi
* Fatura lifecycle (draft → sent → delivered)

---

## 🧠 EKSTRA ÖZELLİKLER

* Multi-language support
* Multi-currency
* Discount & coupon engine
* Role-based access control
* Audit logging
* Feature flag system (tenant bazlı)

---

## 📁 ÇIKTI FORMATI

Aşağıdaki formatta detaylı çıktı üret:

1. Proje klasör yapısı
2. Tüm modüllerin açıklaması
3. Örnek backend kod yapıları (.NET)
4. API endpoint listesi
5. Event schema örnekleri
6. Database tasarım önerisi
7. Frontend component yapısı
8. Builder JSON schema örneği
9. Payment / Shipping / Invoice adapter örnekleri

---

## ⚠️ ÖNEMLİ

* Gerçek production sistemi gibi düşün
* Basit örnekler değil, gerçek mimari öner
* Modüler, genişletilebilir ve SaaS uyumlu tasarla
* Teknik detaylardan kaçınma

---

## 🎯 AMAÇ

Bu sistemi kullanarak:

* IKAS benzeri bir e-ticaret SaaS ürünü geliştirmek
* Hızlı ölçeklenebilir bir altyapı kurmak
* Yeni müşterileri hızlı onboard edebilmek

---

Detaylı, teknik ve uygulanabilir bir çözüm üret.
