# E-Ticaret CRM — Gap Analizi & Uygulama Yol Haritası

> **Amaç:** `Wixi_DB_Tasarim_v4_SifirdanAnaliz.docx` (ideal 62 tablo) ile mevcut Wixi kod tabanını karşılaştırmak, eksikleri önceliklendirmek ve faz planına dökmek.
>
> **Kaynaklar:** `ETicaret_CRM_Proje_Dokumani.docx` (iş kapsamı) · `Wixi_DB_Tasarim_v4_SifirdanAnaliz.docx` (DB tasarımı) · graphify graph (`graphify-out/graph.json`) · mevcut `Wixi.Modules.ECommerce` + `Wixi.Modules.Core` domain entity'leri.
>
> **Tarih:** 2026-06-14 · **Hazırlayan:** Claude Code analizi

---

## 0. Yönetici Özeti

DB tasarım dökümanı *"mevcut sistem yok sayılarak idealden"* yazılmış. Ama gerçekte Wixi'de **olgun, canlı bir e-ticaret omurgası var** (`Wixi.Modules.ECommerce`, tam CQRS, 30 entity, ~25 controller, tenant migration'ları).

**Sonuç: Bu bir "sıfırdan kurulum" değil, mevcut omurganın üzerine CRM katmanı ekleme işidir.**

| Katman | Durum |
|---|---|
| Ürün / Katalog / Sipariş / Ödeme / Sepet | ✅ Hazır omurga |
| Stok / Depo (temel) | ✅ Var |
| Master REF_* tanımlama kartları (22 tablo) | ✅ ~%95 tam |
| Identity / Tenant / Abonelik | ✅ Tam |
| **CRM çekirdeği (Notlar, RFM, 360° profil)** | ❌ **Yok — dökümanın asıl konusu** |
| **Cari / B2B (detaylı)** | 🟡 Basit `WixiContact` var, detaylı yapı yok |
| **Destek / Ticket / SLA** | ❌ Yok |
| **Tedarikçi & Satın Alma (PO)** | ❌ Yok |
| **Kargo & İade (RMA)** | ❌ Yok |
| **Pazarlama / Kampanya otomasyonu** | ❌ Yok |
| **Finans / e-Fatura** | ❌ Yok |

İdealdeki 62 tablonun **~32'si bir karşılığa sahip**, **~30'u eksik**. Eksiklerin çoğu tam da "CRM"i CRM yapan kısımlar.

---

## 1. Master DB — Tam Eşleme

> İdeal: 22 tablo (14 + 8). Mevcut: `Wixi.Modules.Core/Domain/Entities/`.

| İdeal Tablo | Mevcut Entity | Durum |
|---|---|---|
| WIXI_USERS | `WixiUser` | ✅ |
| WIXI_ROLES | `WixiRole` | ✅ |
| WIXI_USER_ROLES | (rol ilişkisi) | ✅ |
| WIXI_REFRESH_TOKENS | `WixiRefreshToken` | ✅ |
| WIXI_OTP_CODES | `WixiTwoFactorCode` | ✅ |
| WIXI_TENANTS | `WixiTenant` | ✅ |
| WIXI_SUBSCRIPTION_PLANS | `WixiSubscriptionPlan` | ✅ |
| WIXI_CUSTOM_DOMAINS | — | ❌ Eksik (özel alan adı entity'si yok) |
| REF_REGIONS | `WixiRegion` (+ `WixiCountry/State/City`) | ✅ |
| REF_PORTS | `WixiPort` | ✅ |
| REF_PAYMENT_TERMS | `WixiPaymentTerm` | ✅ |
| REF_TAX_OFFICES | `WixiTaxOffice` | ✅ |
| REF_INCOTERMS | `WixiIncoterm` | ✅ |
| REF_TRANSPORT_MODES | `WixiTransportMode` | ✅ |
| REF_PACKAGE_TYPES | `WixiPackageType` | ✅ |
| REF_UNIT_CATEGORIES | `WixiUnitCategory` | ✅ |
| REF_UNITS | `WixiUnit` | ✅ |
| REF_UNIT_CONVERSIONS | `WixiUnitConversion` | ✅ |
| REF_HS_CODES | `WixiHsCode` | ✅ |
| REF_SERVICE_CATEGORIES | `WixiServiceCategory` | ✅ |
| REF_SERVICES | `WixiService` | ✅ |
| WIXI_MENUS | `WixiMenu` (+ `WixiMenuTranslation`) | ✅ |

**Master DB sonucu:** 22/22'nin 21'i tam. Yalnızca `WIXI_CUSTOM_DOMAINS` eksik (düşük öncelik — SaaS özel domain ihtiyacı doğduğunda eklenir).

---

## 2. Per-Tenant DB — Tam Eşleme

> İdeal: 48 tablo. Mevcut: `Wixi.Modules.ECommerce/Domain/Entities/` (30 entity).

### 2.1 Katalog ✅ (omurga hazır)

| İdeal Tablo | Mevcut Entity | Durum | Not |
|---|---|---|---|
| ECOM_CATEGORIES | `WixiCategory` | ✅ | |
| ECOM_BRANDS | `WixiBrand` | ✅ | |
| ECOM_PRODUCTS | `WixiProduct` | ✅ | |
| ECOM_PRODUCT_VARIANTS | `WixiProductVariant` | ✅ | |
| ECOM_VARIANT_ATTRIBUTES | `WixiProductVariant.AttributesJson` | 🟡 | Ayrı tablo yerine JSON kolonu — tasarım tercihi, sorgulanabilirlik gerekirse normalize edilir |
| ECOM_PRODUCT_IMAGES | `WixiProductMedia` | ✅ | |
| ECOM_PRODUCT_REVIEWS | — | ❌ | Ürün yorumu yok (`WixiTestimonial` farklı — genel referans) |

### 2.2 Müşteri (B2C) 🟡 (var ama "ince")

| İdeal Tablo | Mevcut Entity | Durum | Not |
|---|---|---|---|
| ECOM_CUSTOMERS | `WixiCustomer` | 🟡 | **İnce profil:** sadece ad/mail/telefon/şifre. RFM segment, LTV, TotalOrders, LoyaltyLevel/Points, KVKK opt-in alanları **yok** |
| ECOM_CUSTOMER_ADDRESSES | `WixiAddress` | ✅ | |
| ECOM_CUSTOMER_COMM_LOGS | — | ❌ | Mail/SMS/Push iletişim logu yok |

### 2.3 Cari (B2B) 🟡 (basit düz yapı)

| İdeal Tablo | Mevcut Entity | Durum | Not |
|---|---|---|---|
| CARI_ACCOUNTS | `WixiContact` | 🟡 | **Düz kart:** Name/Tax/Email/Balance + `ContactType` (Supplier/Customer). Kredi limiti, ödeme koşulu, lojistik tercihi, çoklu adres/kişi **yok** |
| CARI_CONTACTS | — | ❌ | Çoklu yetkili kişi yok (tek `ContactPersonName` string) |
| CARI_ADDRESSES | — | ❌ | Çoklu adres yok (tek `Address` string) |
| CARI_TRANSACTIONS | `WixiCariLedger` | 🟡 | Hareket var (`EntryType`, `Amount`, `BalanceAfter`) ama vade/döviz/referans tipi sınırlı |
| CARI_RECONCILIATIONS | — | ❌ | Dönemsel mutabakat yok |

> **Not:** `WixiContact` hem Cari hem Tedarikçi'yi `ContactType` ile tek tabloda tutuyor. Döküman bunları ayırıyor (`CARI_*` vs `SUPPLIER_*`). Karar gerekli → bkz. §4 Açık Kararlar.

### 2.4 Sipariş & Ödeme ✅

| İdeal Tablo | Mevcut Entity | Durum | Not |
|---|---|---|---|
| ECOM_CARTS | (sepet başlığı) | 🟡 | `WixiCartItem` var; ayrı sepet başlığı/kupon/expire belirsiz |
| ECOM_CART_ITEMS | `WixiCartItem` | ✅ | |
| ECOM_ORDERS | `WixiOrder` | ✅ | |
| ECOM_ORDER_ITEMS | `WixiOrderItem` | ✅ | |
| ECOM_PAYMENTS | `WixiPaymentLog` | 🟡 | Iyzipay-özel log; çoklu ödeme yöntemi/taksit/iade alanları genişletilmeli |
| ECOM_DISCOUNTS | `WixiCoupon` | ✅ | |

### 2.5 Stok & Depo 🟡 (temel var)

| İdeal Tablo | Mevcut Entity | Durum | Not |
|---|---|---|---|
| INV_WAREHOUSES | `WixiWarehouse` | ✅ | |
| INV_STOCK_LEVELS | `WixiStock` (+ `WixiProductVariant.StockQuantity/ReservedQuantity`) | 🟡 | Stok var; çok-depolu seviye matrisi netleştirilmeli |
| INV_STOCK_MOVEMENTS | `WixiStockMovement` | ✅ | |
| INV_STOCK_COUNTS | — | ❌ | Sayım modülü yok |
| INV_STOCK_COUNT_ITEMS | — | ❌ | Sayım kalemleri yok |

### 2.6 Tedarikçi & Satın Alma ❌ (tamamen eksik — 8 tablo)

| İdeal Tablo | Durum |
|---|---|
| SUPPLIER_ACCOUNTS | 🟡 Kısmi (`WixiContact` ContactType=Supplier) |
| SUPPLIER_CONTACTS / SUPPLIER_ADDRESSES / SUPPLIER_PRODUCTS | ❌ |
| PO_PURCHASE_ORDERS / PO_PURCHASE_ORDER_ITEMS | ❌ |
| PO_RECEIPTS / PO_RECEIPT_ITEMS | ❌ |

### 2.7 Kargo & İade ❌ (tamamen eksik — 4 tablo)

| İdeal Tablo | Durum |
|---|---|
| CARGO_CARRIERS | ❌ Kargo firma/API tanımı yok |
| CARGO_SHIPMENTS | ❌ Gönderi takibi yok |
| RMA_RETURN_REQUESTS / RMA_RETURN_ITEMS | ❌ İade/değişim akışı yok |

### 2.8 Müşteri Destek ❌ (tamamen eksik — 2 tablo)

| İdeal Tablo | Durum |
|---|---|
| SUPPORT_TICKETS | ❌ (yalnızca `WixiContactFormSubmission` var — iletişim formu, ticket değil) |
| SUPPORT_TICKET_MESSAGES | ❌ |

### 2.9 Pazarlama ❌ (tamamen eksik — 2 tablo)

| İdeal Tablo | Durum |
|---|---|
| MKT_CAMPAIGNS | ❌ (`WixiNewsletterSubscription` var ama kampanya motoru yok) |
| MKT_CAMPAIGN_RECIPIENTS | ❌ |

### 2.10 Sadakat 🟡 (hareket var, ayarlar yok)

| İdeal Tablo | Mevcut Entity | Durum |
|---|---|---|
| LYL_PROGRAMS | — | ❌ Puan kuralı/seviye ayarları yok |
| LYL_CUSTOMER_POINTS | (bakiye hesaplanıyor) | 🟡 Ayrı bakiye tablosu yok |
| LYL_POINT_TRANSACTIONS | `WixiLoyaltyPoint` | ✅ Hareket var (Earned/Spent/Expired/Adjusted) |

### 2.11 Finans ❌ (eksik — 1 tablo)

| İdeal Tablo | Durum |
|---|---|
| FIN_INVOICES | ❌ e-Fatura/e-Arşiv entity'si yok |

### 2.12 CRM Çekirdeği ❌ (tamamen eksik — dökümanın asıl konusu — 2 tablo)

| İdeal Tablo | Durum |
|---|---|
| CRM_CUSTOMER_NOTES | ❌ Admin müşteri notu yok |
| CRM_RFM_SNAPSHOTS | ❌ RFM hesaplama/segmentasyon yok |

---

## 3. Mevcut Ama Dökümanda Olmayan (Storefront / CMS Katmanı)

Döküman bunları kapsamamış; mevcut kodun web-builder/storefront tarafı:

`WixiStorePage`, `WixiStoreSettings`, `WixiSlider` + `WixiSliderSlide`, `WixiPromoBanner`, `WixiTestimonial`, `WixiThemeVersion`, `WixiFaqItem`, `WixiFavorite`, `WixiNewsletterSubscription`, `WixiContactFormSubmission`, `WixiCustomerResetToken`.

→ Bunlar korunur; CRM eklemeleri bunları etkilemez.

---

## 4. Mimari Kararlar → [DECISIONS.md](DECISIONS.md) (tümü VERİLDİ 2026-06-14)

> Bu bölümdeki açık kararlar artık karara bağlandı. Tek kaynak: **[DECISIONS.md](DECISIONS.md)**. Özet: **D-07** Cari/Tedarikçi ayrı tablolar · **D-04** ECommerce içinde · **D-05** mevcut provisioner · **D-06** BackgroundService · **D-01** kargo · **D-02** dosya saklama · **D-03** referans çerçevesi.

<details><summary>Önceki açık karar metni (arşiv)</summary>

1. **Cari/Tedarikçi ayrımı:** Mevcut `WixiContact` ikisini `ContactType` ile birleştiriyor. Döküman ayırıyor. → Mevcut birleşik yapıyı genişletmek mi, yoksa `CARI_*`/`SUPPLIER_*` olarak ayırmak mı? **Öneri:** mevcut `WixiContact`'ı zenginleştirip korumak (migration maliyeti düşük), detaylı PO ihtiyacı doğunca ayrıştırmak.
2. **Modül sınırı:** CRM tabloları yeni `Wixi.Modules.Crm` projesine mi, yoksa mevcut `Wixi.Modules.ECommerce` içine mi? Tablolar `ECOM_CUSTOMERS`'a bağımlı (aynı per-tenant DB). **Öneri:** İlk fazda ECommerce modülü içinde `Application/Crm/` + `Domain/Entities/` olarak; modül şişerse ayrıştırma.
3. **Provisioner:** Yeni tablolar mevcut `ECommerceTenantProvisioner` migration'ına eklenir (ayrı modül seçilirse yeni provisioner). Per-tenant DB aynı.
4. **RFM hesaplama:** Günlük snapshot bir background job ister (mevcut `MailingBackgroundWorker` pattern'i örnek alınabilir).

</details>

---

## 5. Uygulama Yol Haritası (Faz Planı)

> Öncelik = iş değeri (döküman §11 matrisi) × mevcut altyapıya yakınlık. Omurga hazır olduğundan CRM çekirdeği hızlı kazanç.

### 🔴 Faz 1 — CRM Çekirdeği (Sprint 1–2)
Dökümanın adını taşıyan asıl değer. Mevcut `WixiCustomer` + `WixiOrder` üzerine kurulur, düşük risk.

| İş | Tablo/Entity | Bağımlılık |
|---|---|---|
| Müşteri 360° profil genişletme | `WixiCustomer` + RFM/LTV/segment/KVKK alanları | mevcut |
| Müşteri notları | `CRM_CUSTOMER_NOTES` (`WixiCustomerNote`) | `WixiCustomer` |
| RFM snapshot + günlük job | `CRM_RFM_SNAPSHOTS` (`WixiRfmSnapshot`) | `WixiOrder` geçmişi |
| Sadakat ayarları | `LYL_PROGRAMS` (`WixiLoyaltyProgram`) | mevcut `WixiLoyaltyPoint` |

### 🔴 Faz 2 — Cari/B2B + Destek (Sprint 3–4)

| İş | Tablo/Entity | Bağımlılık |
|---|---|---|
| Cari kart zenginleştirme | `WixiContact` + kredi/ödeme/lojistik alanları | mevcut |
| Cari çoklu kişi/adres | `CARI_CONTACTS`, `CARI_ADDRESSES` | `WixiContact` |
| Mutabakat | `CARI_RECONCILIATIONS` | `WixiCariLedger` |
| Destek ticket + SLA | `SUPPORT_TICKETS`, `SUPPORT_TICKET_MESSAGES` | `WixiCustomer`, `WixiOrder` |

### 🟠 Faz 3 — Operasyon (Sprint 5–6)

| İş | Tablo/Entity |
|---|---|
| Kargo entegrasyon | `CARGO_CARRIERS`, `CARGO_SHIPMENTS` |
| İade/değişim (RMA) | `RMA_RETURN_REQUESTS`, `RMA_RETURN_ITEMS` |
| Tedarikçi & PO | `SUPPLIER_*`, `PO_*` (8 tablo) |
| Stok sayım | `INV_STOCK_COUNTS`, `INV_STOCK_COUNT_ITEMS` |

### 🟡 Faz 4 — Büyüme & Finans (Sprint 7+)

| İş | Tablo/Entity |
|---|---|
| Pazarlama kampanya motoru | `MKT_CAMPAIGNS`, `MKT_CAMPAIGN_RECIPIENTS` |
| e-Fatura | `FIN_INVOICES` |
| Müşteri iletişim logu | `ECOM_CUSTOMER_COMM_LOGS` |
| Ürün yorumları | `ECOM_PRODUCT_REVIEWS` |
| Özel domain | `WIXI_CUSTOM_DOMAINS` (Master) |

---

## 6. Uygulama Notları (Wixi pattern uyumu)

Her yeni entity/feature, projenin mevcut konvansiyonlarına uyar:

- **Entity:** `Wixi` prefix (`WixiCustomerNote`), `IAuditable` implement, per-tenant `ECommerceDbContext`'e `DbSet` eklenir.
- **CQRS:** `Application/Crm/Commands/<Action>/` + `Queries/<Action>/` (Command + Handler ayrı dosya).
- **Controller:** doğru alt-klasör (`StoreAdmin/` veya yeni `Crm/`), namespace `Wixi.API.Controllers.<Domain>`, god controller yok.
- **Migration:** `Wixi.Modules.ECommerce/Migrations/Tenant/` altına; idempotent (`IF OBJECT_ID ... IS NULL`).
- **Frontend:** `pages/store-admin/` altında yeni sayfa; zorunlu shared UI bileşenleri (`Input/Select/Button/Modal/Switch`), ham `<input>` yasak.
- **RFM job:** `MailingBackgroundWorker` pattern'i ile hosted service.

---

## 7. Sonraki Adım

Bu plan onaylanırsa:
1. Faz 1 görevleri **ClickUp**'a açılır (liste: `E-Commerce & Store` / `Store Admin`, sprint tarihleriyle).
2. Faz 1 için detaylı entity + CQRS + migration tasarımı (`plan` skill) çıkarılır.
3. graphify rebuild — yeni CRM modülü eklenince graph güncellenir.
