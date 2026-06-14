# M10 — Tedarikçi & Satın Alma

> **Durum:** ❌ Greenfield (cari kart hariç) · **Faz:** 3 · **Öncelik:** 🟠 Yüksek · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Tedarikçi portföyü, performans skorlaması, ürün-fiyat listesi, satın alma siparişi (PO) + onay akışı, mal kabul + kalite kontrol, tek-tedarikçi risk analizi.

---

## Mevcut Durum (kodda ne var)
- **Sadece** `WixiContact` (`ContactType.Supplier=1` varsayılan) + `WixiCariLedger` — M04'le ortak basit kart. `StoreAdminCariController` tüm contact'ları (cari+tedarikçi) yönetiyor.
- **Yok:** tedarikçi performans, ürün-fiyat listesi, PO, mal kabul — hiçbiri.

## ✅ D-07 Kararı: `SUPPLIER_*` ayrı tablolar
Mevcut `WixiContact` (Supplier/Both) → `WixiSupplierAccount` migrate (M04 cari migration'ı ile **koordineli** — `Both` tipi hem cari hem tedarikçi olur).

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Mevcut | Durum |
|---|---|---|---|
| SUPPLIER_ACCOUNTS | `WixiSupplierAccount` (yeni) | `WixiContact` (Supplier/Both) | 🟡 Migrate + zenginleştir |
| SUPPLIER_CONTACTS / ADDRESSES / PRODUCTS | `WixiSupplierContact/Address/Product` (yeni) | — | ❌ |
| PO_PURCHASE_ORDERS / ITEMS | `WixiPurchaseOrder` + `WixiPurchaseOrderItem` (yeni) | — | ❌ |
| PO_RECEIPTS / ITEMS | `WixiPoReceipt` + `WixiPoReceiptItem` (yeni) | — | ❌ |

## Bağımlılıklar
- **Girdi:** M00 (ödeme koşulu, transport — string kopya D-03), M01 Katalog (tedarik edilen ürün).
- **Çıktı:** M07 Stok (mal kabul → `GRN` + `InTransitQty`), M13 Raporlama (tedarikçi risk/performans), M04 (ortak `Both` migration).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** ECommerce içinde `Application/Crm/Supplier/`, DbSet `ECommerceDbContext`. Migration M04 ile koordineli.

#### 1.1. `WixiSupplierAccount`
```
Id, CompanyName, SupplierCode (unique 'S-00001')
TaxNumber, TaxOfficeName (M00 kopya)
CurrencyCode, PaymentTermName/Days (M00 kopya)
// Performans (son 12 ay — job hesaplar, D-06)
DeliveryScore, QualityScore, PriceScore, OverallScore  decimal(4,2)
// İletişim & lojistik
Website, Email, Phone
PreferredTransportMode (M00 kopya), TypicalLeadDays int
IsBlacklisted bool
+ IAuditable
```

#### 1.2. `WixiSupplierContact` / `WixiSupplierAddress`
> M04 `WixiCariContact`/`WixiCariAddress` ile **aynı desen** (çoklu kişi/adres). AddressType: Headquarter/Warehouse/Factory/Invoice.

#### 1.3. `WixiSupplierProduct` (tedarikçi-ürün fiyat listesi)
```
Id, SupplierId (FK), ProductId (FK), VariantId?
SupplierSku, UnitCost, MinOrderQty, LeadDays
IsPreferred bool   // bu ürün için tercihli tedarikçi
LastUpdated
```
> Bir ürün çoklu tedarikçiden gelebilir → fiyat karşılaştırma + tek-tedarikçi risk (M13).

#### 1.4. `WixiPurchaseOrder` + `WixiPurchaseOrderItem`
```
WixiPurchaseOrder: Id, PoNumber (unique 'PO-2026-00001'), SupplierId (FK), WarehouseId (FK — teslim deposu)
  Status enum { Draft, PendingApproval, Approved, Sent, PartiallyReceived, Received, Cancelled }
  SubTotal, TaxAmount, TotalAmount, CurrencyCode
  ExpectedDate, ActualDate, ShippingNote
  ApprovedByUser, ApprovedAt, Note, CreatedByUser
  + IAuditable
WixiPurchaseOrderItem: Id, PoId (FK), ProductId, VariantId?, ProductName (snapshot)
  UnitCost, Quantity, ReceivedQty, TaxRate, TotalCost
```

#### 1.5. `WixiPoReceipt` + `WixiPoReceiptItem` (mal kabul)
```
WixiPoReceipt: Id, PoId (FK), ReceiptNumber (unique), ReceivedAt, Note, CreatedByUser
WixiPoReceiptItem: Id, ReceiptId (FK), PoItemId (FK)
  ReceivedQty, AcceptedQty (QC'den geçen), RejectedQty
  LotNumber, ExpiryDate, Note
```

---

### 2. İş Kuralları & Akış

| Akış | Mantık |
|---|---|
| **PO durum makinesi** | Draft → PendingApproval → Approved → Sent → PartiallyReceived → Received. Onay store-admin yetkisi. |
| **Sipariş → stok yolda** | PO `Sent` olunca kalemler `WixiStock.InTransitQty +=` (M07). |
| **Mal kabul → GRN** | `WixiPoReceipt` kalemi `AcceptedQty` → M07 `GRN` hareketi (`Quantity +=`, `InTransitQty -=`). `PoItem.ReceivedQty +=`. Tümü gelince PO `Received`. |
| **Kalite kontrol** | `RejectedQty` stoka girmez (tedarikçiye iade). |
| **Performans skoru** | `BackgroundService` (D-06) son 12 ay: teslim süresi (Expected vs Actual), QC red oranı, fiyat rekabeti → `DeliveryScore/QualityScore/PriceScore/OverallScore`. |
| **Otomatik PO önerisi** | M07 `LowStockEvent` → tercihli tedarikçinin (`IsPreferred`) ReorderQty'siyle taslak PO önerir. |
| **Tek-tedarikçi riski** | Ürünün tek tedarikçisi varsa M13 risk uyarısı. |

---

### 3. CQRS (`Application/Crm/Supplier/`)

| Komut | İş |
|---|---|
| `UpsertSupplierCommand` + contact/address/product CRUD | Tedarikçi kartı yönetimi |
| `CreatePurchaseOrderCommand` / `ApprovePurchaseOrderCommand` / `SendPurchaseOrderCommand` / `CancelPurchaseOrderCommand` | PO yaşam döngüsü |
| `CreatePoReceiptCommand` | Mal kabul (QC + GRN event) |

| Sorgu | İş |
|---|---|
| `GetSuppliersQuery` / `GetSupplier360Query` | Liste / kart (kişi/adres/ürün/PO geçmişi/skor) |
| `GetPurchaseOrdersQuery` / `GetPoByIdQuery` | PO liste/detay |
| `GetSupplierPriceComparisonQuery(productId)` | Ürün için tedarikçi fiyat karşılaştırma |
| `GetSupplierRiskReportQuery` | Tek-tedarikçi/risk (M13) |

> **Event (D-04):** `PoReceiptCompletedEvent` → M07 GRN; `LowStockEvent` (M07) → PO önerisi.

---

### 4. Endpoint'ler (`/store-admin/suppliers`, `/store-admin/purchase-orders`)

| Metot | Route |
|---|---|
| GET/POST/PUT · GET{id} | `/store-admin/suppliers` (+contacts/addresses/products alt yolları) |
| GET/POST · GET{id} · PATCH{id}/approve·send·cancel | `/store-admin/purchase-orders` |
| POST | `/store-admin/purchase-orders/{id}/receipts` (mal kabul) |
| GET | `/store-admin/suppliers/{id}/price-comparison` · `/store-admin/suppliers/risk` |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| Store-admin tedarikçi listesi/kart | ❌ yeni | Sekmeler: Genel · Yetkililer · Adresler · Ürün-fiyat · PO geçmişi · Skor |
| PO oluştur/onay | ❌ yeni | Tedarikçi seç → kalem ekle → onay akışı → gönder |
| Mal kabul | ❌ yeni | PO seç → gelen/kabul/red miktar + lot → GRN |

> Zorunlu shared UI; PO/mal kabul `Modal` adımları.

---

## Açık Sorular
- **O-T1:** D-07 migration — `Both` tedarikçi M04 ile koordineli; ortak `TaxNumber` eşleme. (M04 O-CA1 ile aynı.)
- **O-T2:** PO onay çok kademeli mi (tutar bazlı) tek onay mı? → öneri: tek onay başla, tutar eşikli çok kademe sonra.
- **O-T3:** Tedarikçiye PO gönderimi (e-posta/portal) hangi faz? → öneri: önce PDF + mail (M00 mail), portal sonra.

## Detay Tasarım (TODO)
- [ ] **D-07 Migration:** `WixiContact`(Supplier/Both)→`WixiSupplierAccount` (M04 koordineli)
- [ ] `WixiSupplierAccount` + `Contact`/`Address`/`Product` entity'leri
- [ ] `WixiPurchaseOrder` + `WixiPurchaseOrderItem` + durum makinesi
- [ ] `WixiPoReceipt` + `WixiPoReceiptItem` (QC + GRN)
- [ ] `PoReceiptCompletedEvent` → M07 GRN; `LowStockEvent` → PO önerisi tüketici
- [ ] Performans skoru `BackgroundService` (D-06)
- [ ] CQRS + endpoint'ler (suppliers, purchase-orders, receipts, price-comparison, risk)
- [ ] Frontend: tedarikçi kartı + PO + mal kabul ekranları
