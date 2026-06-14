# M07 — Stok & Depo

> **Durum:** 🟡 Temel var, kritik refactor · **Faz:** 0 / 3 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Çok depolu stok: seviyeler (eldeki/rezerve/yolda), hareketler, kritik eşik uyarısı, lot/seri takibi, sayım. Temel mevcut; ama **çift stok kaynağı sorunu**, sayım modülü ve hareket izlenebilirliği eksik.

---

## Mevcut Durum (kodda ne var)

| Dosya | İçerik |
|---|---|
| `WixiStock` | `VariantId, WarehouseId, Quantity, ReservedQuantity, UpdatedAt` (depo bazlı) |
| `WixiStockMovement` | `VariantId, WarehouseId, Type, Quantity, Notes, MovementDate, ToWarehouseId` + IAuditable |
| `WixiWarehouse` | `Name, Code, Address, IsDefault` + Stocks[]/Movements[] |
| `WixiProductVariant` | **`StockQuantity, ReservedQuantity, LowStockThreshold`** ← stok BURADA DA var |
| `Application/Stock/` | `CreateStockMovement` · `GetStockByWarehouse` · `GetStockMovements` |
| `StoreAdminStockController` | GET stock · GET movements · POST movements |
| `StoreAdminWarehousesController` | GET · POST · PUT{id} |
| Frontend | `StoreStockPage`, `StoreWarehouseReportPage` (store-admin), `InventoryPage` (admin) |

**`StockMovementType`:** `GRN=1 (mal girişi), SALE=2, RTN=3 (iade), TRF=4 (transfer), ADJ=5 (düzeltme)`.

---

## ⚠️ Kritik Sorun: Çift Stok Kaynağı

Stok **iki yerde** tutuluyor:
1. `WixiStock.Quantity/ReservedQuantity` — depo bazlı (doğru yer)
2. `WixiProductVariant.StockQuantity/ReservedQuantity` — varyant üzerinde tek sayı

→ **Senkron kalmazlarsa tutarsızlık** (oversell riski). **Karar gerekli (O-S1).**
> **Öneri:** `WixiStock` **tek doğruluk kaynağı** olur (çok depo destekler). `WixiProductVariant.StockQuantity` → ya kaldırılır ya da tüm depoların toplamını yansıtan **cache/computed** alana indirgenir (storefront hız için), her hareket sonrası güncellenir. Bu, M07'nin **ilk işi**.

---

## İlgili Tablolar (ideal → mevcut)
| İdeal | Mevcut | Durum |
|---|---|---|
| INV_WAREHOUSES | `WixiWarehouse` | ✅ (City/raf detayı eklenebilir) |
| INV_STOCK_LEVELS | `WixiStock` | 🟡 AvailableQty computed, InTransitQty, eşik, ShelfLocation eksik |
| INV_STOCK_MOVEMENTS | `WixiStockMovement` | 🟡 Direction, Before/AfterQty, Reference, Lot/Seri eksik |
| INV_STOCK_COUNTS / ITEMS | — | ❌ Sayım modülü yok |

## Bağımlılıklar
- **Girdi:** M01 Katalog (varyant), M06 Sipariş (rezervasyon/satış), M09 İade (restok), M10 Tedarikçi (mal kabul → GRN).
- **Çıktı:** M01/storefront (mevcut stok gösterimi), M13 Raporlama (stok değeri, kritik eşik).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** Genişletmeler ECommerce içinde, DbSet'ler `ECommerceDbContext`'te.

#### 1.1. Tek kaynak refactor (O-S1 — ilk iş)
`WixiStock` = doğruluk kaynağı. `WixiProductVariant.StockQuantity` → toplam cache (her hareket sonrası `SUM(WixiStock.Quantity)` ile güncellenir) veya kaldırılır.

#### 1.2. `WixiStock` genişletmesi
```
+ AvailableQty   computed (Quantity - ReservedQuantity)   // EF computed/SQL
+ InTransitQty   int        // tedarikçiden yolda (M10 PO)
+ ReorderPoint   int        // yeniden sipariş noktası
+ ReorderQty     int
+ ShelfLocation  string?     // 'A-12-3'
// LowStockThreshold variant'tan buraya taşınabilir (depo bazlı eşik)
```

#### 1.3. `WixiStockMovement` genişletmesi (izlenebilirlik)
```
+ Direction    enum { In, Out }       // Type'tan türetilir ama açık tutmak rapora iyi
+ BeforeQty    int                    // hareket öncesi
+ AfterQty     int                    // hareket sonrası → tam audit trail
+ ReferenceId  Guid?                  // Sipariş ID / PO ID / İade ID
+ ReferenceType enum { Order, PurchaseOrder, Return, StockCount, Manual }
+ ReferenceNo  string?                // ORD-.., PO-..
+ LotNumber/SerialNumber  string?
+ ExpiryDate   DateTime?
+ UnitCost/TotalCost  decimal?        // stok değerleme (FIFO/FEFO)
```
> `StockMovementType`'a `DMG (hasar)`, `CNT (sayım düzeltme)` eklenir.

#### 1.4. Sayım — `WixiStockCount` + `WixiStockCountItem` (yeni)
```
WixiStockCount: Id, WarehouseId, CountDate, Status{Draft,InProgress,Completed,Cancelled},
                StartedAt, CompletedAt, CreatedByUser, Note
WixiStockCountItem: Id, CountId, VariantId, ExpectedQty, CountedQty,
                    Difference (computed), IsAdjusted
```
> Sayım tamamlanınca fark `ADJ`/`CNT` hareketine dönüşür, `WixiStock` güncellenir.

---

### 2. Rezervasyon & Hareket Akışı (M06 event entegrasyonu)

| Tetik | Hareket | WixiStock etkisi |
|---|---|---|
| Sipariş oluştu (Pending→Paid) | `SALE` rezerve | `ReservedQuantity += qty` |
| `OrderDeliveredEvent` (M06) | `SALE` kesinleş | `Quantity -= qty`, `ReservedQuantity -= qty` |
| `OrderCancelledEvent` (M06) | rezervasyon iptal | `ReservedQuantity -= qty` |
| İade onaylandı (M09, restok) | `RTN` | `Quantity += qty` (Condition uygunsa) |
| PO mal kabul (M10) | `GRN` | `Quantity += qty`, `InTransitQty -= qty` |
| Transfer | `TRF` | kaynak `-`, hedef `+` (ToWarehouseId) |
| Sayım farkı | `CNT`/`ADJ` | `Quantity = CountedQty` |

> **Her hareket atomik:** `WixiStock` güncelle + `WixiStockMovement` insert (Before/AfterQty ile) aynı transaction'da. Oversell'e karşı satışta `AvailableQty` kontrolü.
> **Kritik eşik:** hareket sonrası `AvailableQty <= ReorderPoint` ise `LowStockEvent` → uyarı/otomatik PO önerisi (M10). BackgroundService (D-06) günlük tarama da yapabilir.

---

### 3. CQRS (`Application/Stock/`)

**Mevcut korunur, genişletilir:** `CreateStockMovement` (Before/After + Reference), `GetStockByWarehouse`, `GetStockMovements`.

**Yeni:**
| Komut/Sorgu | İş |
|---|---|
| `ReserveStockCommand` / `ReleaseStockCommand` | M06 event'lerinden çağrılır |
| `TransferStockCommand` | Depo transferi (TRF) |
| `CreateStockCountCommand` / `SubmitStockCountCommand` | Sayım başlat/tamamla |
| `GetLowStockQuery` | Kritik eşik altı liste (dashboard + PO önerisi) |
| `GetStockValuationQuery` | Stok değeri (UnitCost × Quantity) — M13 |

---

### 4. Endpoint'ler

| Metot | Route | Durum |
|---|---|---|
| GET · GET movements · POST movements | `/store-admin/stock` | ✅ (genişlet: reference, before/after) |
| GET/POST/PUT | `/store-admin/warehouses` | ✅ |
| POST | `/store-admin/stock/transfer` | ❌ yeni |
| GET/POST | `/store-admin/stock/counts` (+{id}/submit) | ❌ yeni (sayım) |
| GET | `/store-admin/stock/low` | ❌ yeni (kritik eşik) |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| `StoreStockPage` | 🟡 | çok-depolu seviye matrisi, AvailableQty, kritik eşik vurgusu |
| `StoreWarehouseReportPage` | 🟡 | stok değeri, hareket geçmişi (reference linkli) |
| Sayım ekranı | ❌ yeni | sayım başlat → kalem gir → tamamla (fark otomatik ADJ) |

---

## Açık Sorular
- **O-S1 (kritik):** `WixiStock` mu `WixiProductVariant.StockQuantity` mı tek kaynak? → öneri: **WixiStock**, variant'taki cache/computed olur.
- **O-S2:** FIFO/LIFO/FEFO değerleme gerçek ihtiyaç mı? → öneri: UnitCost ile FIFO altyapısı kur, değerleme raporu sonra (M13).
- **O-S3:** Varyantsız ürün stoğu? `WixiStock` sadece `VariantId` tutuyor — her ürünün default varyantı mı olmalı?

## Detay Tasarım (TODO)
- [x] Veri modeli + akış + CQRS + endpoint + frontend tasarımı
- [ ] **O-S1 refactor:** tek stok kaynağı (`WixiStock`), variant cache senkronu
- [ ] `WixiStock` genişletme (Available computed, InTransit, ReorderPoint, ShelfLocation)
- [ ] `WixiStockMovement` genişletme (Direction, Before/After, Reference, Lot/Seri, UnitCost)
- [ ] `WixiStockCount` + `WixiStockCountItem` entity + CQRS + ekran
- [ ] `ReserveStock`/`ReleaseStock` — M06 `OrderDelivered/Cancelled` event tüketici
- [ ] `LowStockEvent` + kritik eşik tarama (BackgroundService, D-06)
- [ ] Transfer + sayım endpoint'leri + frontend
- [ ] Varyantsız ürün stok kararı (O-S3)
