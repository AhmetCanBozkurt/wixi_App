# M09 — İade & Değişim (RMA)

> **Durum:** ❌ Greenfield · **Faz:** 3 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Online iade talebi, onay/red kuralları, iade nedeni analitiği, iade karşılığı stok güncelleme + müşteri iadesi (refund/exchange/store credit). Tamamen yeni.

---

## Mevcut Durum (kodda ne var)
- **Yok.** Tek mevcut: `OrderStatus.Refunded=6` enum değeri + `StoreAdminOrdersController` status PATCH (manuel "Refunded" işaretleme).
- İade talebi, kalem, neden, onay akışı, restok, fotoğraf — hiçbiri yok.

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Durum |
|---|---|---|
| RMA_RETURN_REQUESTS | `WixiReturnRequest` (yeni) | ❌ |
| RMA_RETURN_ITEMS | `WixiReturnItem` (yeni) | ❌ |

## Bağımlılıklar
- **Girdi:** M06 Sipariş (`WixiOrder`/`WixiOrderItem` — iade edilen), M02 Müşteri.
- **Çıktı:** M07 Stok (restok `RTN`), M06/M12 (refund — ödeme iadesi), M05 Destek (ilişkili ticket), M13 (iade oranı/neden analitiği).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** ECommerce içinde `Application/Crm/Returns/`, DbSet `ECommerceDbContext`. Fotoğraflar **D-02** (relativePath/varbinary, tam URL değil).

#### 1.1. `WixiReturnRequest` (RMA başlığı)
```
Id, RmaNumber (unique 'RMA-2026-00001')
OrderId (FK), CustomerId (FK)
ReturnReason  enum { Damaged, WrongProduct, MindChange, SizeMismatch, NotAsDescribed, Other }
ReturnMethod  enum { Refund, Exchange, StoreCredit }
Status        enum { Pending, Approved, Rejected, Shipped, Received, Completed, Cancelled }
Description   string
ImagePaths    string   // D-02: iade fotoğrafları (JSON relativePath listesi veya ayrı tablo)
RefundAmount  decimal  // onaylanan iade tutarı
RefundedAt    DateTime?
AdminNote     string?
ResolvedByUser string?
+ IAuditable
```

#### 1.2. `WixiReturnItem` (iade kalemleri)
```
Id, ReturnId (FK)
OrderItemId (FK → WixiOrderItem), ProductId, VariantId?
Quantity, UnitPrice
Condition   enum { New, Good, Damaged, Unusable }   // restok kararı için
IsRestocked bool
```

> İade kalemi `WixiOrderItem`'a bağlı; `WixiOrderItem.ReturnedQty` (M06 eklediğimiz alan) güncellenir → kısmi iade takibi.

---

### 2. İade Durum Makinesi & Akış

| Geçiş | Kim | Yan etki |
|---|---|---|
| → Pending | Müşteri (storefront) iade formu | RMA no üret, fotoğraf yükle (D-02) |
| Pending → Approved/Rejected | Store-admin veya **otomatik kural** | Approved → kargo talimatı |
| Approved → Shipped | Müşteri ürünü kargoya verir | iade kargo takip |
| Shipped → Received | Store-admin teslim aldı | kalite kontrol (Condition) |
| Received → Completed | Onay | **restok (M07 `RTN`)** + **refund (M06/M12)** + `WixiOrderItem.ReturnedQty +=` |
| * → Cancelled | İptal | — |

> **Restok kuralı:** `Condition ∈ {New, Good}` → `RTN` hareketi (M07), `IsRestocked=true`. `Damaged/Unusable` → restok yok (hasar/fire).
> **Refund:** `ReturnMethod=Refund` → ödeme iadesi (M06 `RefundPaymentCommand` / M12); `StoreCredit` → sadakat/cüzdan; `Exchange` → yeni sipariş.
> **Otomatik onay (O-R1):** kural motoru — örn. `MindChange` + <14 gün + `New` → otomatik onay; `Damaged` → manuel.

---

### 3. CQRS (`Application/Crm/Returns/`)

**Commands**
| Komut | İş |
|---|---|
| `CreateReturnRequestCommand` | Müşteri iade talebi (storefront) — sipariş/kalem doğrula, RMA üret |
| `ApproveReturnCommand` / `RejectReturnCommand` | Store-admin onay/red (RefundAmount belirle) |
| `MarkReturnReceivedCommand` | Teslim alındı + kalem Condition gir |
| `CompleteReturnCommand` | Restok + refund tetikle (event), ReturnedQty güncelle |
| `CancelReturnCommand` | İptal |

**Queries**
| Sorgu | İş |
|---|---|
| `GetReturnsQuery` | Store-admin liste (durum/neden filtre) |
| `GetReturnByIdQuery` | Detay (kalemler + fotoğraflar + sipariş) |
| `GetMyReturnsQuery` | Müşterinin iadeleri (storefront) |
| `GetReturnReasonStatsQuery` | İade nedeni analitiği (M13 — hangi ürün/neden) |

> **Event (D-04):** `ReturnCompletedEvent` → M07 restok + M06/M12 refund. Doğrudan çağrı değil.

---

### 4. Endpoint'ler

| Katman | Metot | Route |
|---|---|---|
| Storefront | POST · GET my · GET{rma} | `/public/storefront/returns` |
| Store-admin | GET · GET{id} | `/store-admin/returns` |
| Store-admin | PATCH{id}/approve · /reject · /receive · /complete · /cancel | `/store-admin/returns/{id}/...` |
| Store-admin | GET | `/store-admin/returns/reason-stats` |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| Storefront iade formu | ❌ yeni | Sipariş seç → kalem/adet → neden → fotoğraf (`ImageUploadField` D-02) → gönder |
| Storefront "İadelerim" | ❌ yeni | Durum takibi |
| Store-admin iade paneli | ❌ yeni | Liste + detay + onay/red/teslim/tamamla (`Modal`), Condition girişi, RefundAmount |

> Zorunlu shared UI; onay adımları `Modal`. Fotoğraf D-02.

---

## Açık Sorular
- **O-R1:** Otomatik onay/red kuralları config tabanlı mı, sabit mi? → öneri: basit config (gün limiti + neden + condition), ihtiyaç artarsa kural motoru.
- **O-R2:** İade kargo entegrasyonu M08'e mi bağlı (iade etiketi)? → öneri: evet, M08 olgunlaşınca iade etiketi otomatik.
- **O-R3:** `ImagePaths` JSON kolon mu ayrı `WixiReturnImage` tablo mu? → öneri: az sayıda foto → JSON; çok olursa ayrı tablo.

## Detay Tasarım (TODO)
- [x] Veri modeli + durum makinesi + CQRS + endpoint + frontend tasarımı
- [ ] `WixiReturnRequest` + `WixiReturnItem` entity + DbSet + migration
- [ ] İade durum makinesi + otomatik onay kuralı
- [ ] `ReturnCompletedEvent` → M07 restok + M06/M12 refund tüketici
- [ ] `WixiOrderItem.ReturnedQty` güncelleme (M06 ile)
- [ ] CQRS (Application/Crm/Returns/) + storefront/store-admin endpoint'ler
- [ ] Storefront iade formu + "İadelerim" + store-admin iade paneli
- [ ] Fotoğraf yükleme (D-02 relativePath/varbinary)
- [ ] İade nedeni analitiği (M13)
