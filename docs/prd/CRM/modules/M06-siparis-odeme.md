# M06 — Sipariş & Ödeme

> **Durum:** ✅ Omurga güçlü, genişletme · **Faz:** 0 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Sepet, sipariş akışı (durum makinesi), sipariş kalemleri (snapshot), ödeme (Iyzipay + Stripe), indirim/kupon. Omurga ve uçtan-uca akış mevcut; **breakdown, B2B, durum-zaman damgaları, kâr marjı alanları** eksik.

---

## Mevcut Durum (kodda ne var)

| Katman | Mevcut |
|---|---|
| **Akış (Commands)** | `CreateOrder` · `InitiatePayment` · `HandlePaymentCallback` · `UpdateOrderStatus` |
| **Queries** | `GetMyOrders` · `GetOrderById` · `GetOrderByNumber` · `GetOrders` · `GetPaymentLogs` |
| **Sepet** | `Application/Cart/` + `StorefrontCartController` (GET, POST/PUT/DELETE items, DELETE clear) |
| **İndirim** | `Application/Discounts/` (`ApplyCoupon`, `SaveCoupon`) + `WixiCoupon` |
| **Ödeme** | `StorefrontPaymentController` (initiate/callback) + `StripeWebhookController` + `WixiPaymentLog` (Iyzipay) |
| **Store-admin** | `StoreAdminOrdersController` (GET, GET{id}, PATCH{id}/status) · `StoreAdminPaymentsController` (GET) |
| **Ödeme ayarları** | admin + store-admin `payment-settings` (GET/PUT) |
| **Frontend** | `StorefrontCartPage`, `StorefrontCheckoutPage`, `CheckoutSuccess/Cancel`, `PaymentFailed`, `OrderSuccess`, `StorePaymentsPage`, `PaymentSettingsPage` |

**Mevcut `WixiOrder`:** `CustomerId, OrderNumber, TotalAmount, Currency, Status, ShippingAddress(string), BillingAddress(string), TrackingNumber, ShippingProvider, PaymentGateway, PaymentToken` + Items[].
**Mevcut `WixiOrderItem`:** `ProductId, VariantId, ProductName, VariantName, SKU, Quantity, UnitPrice, TotalPrice`.
**`OrderStatus`:** `Pending=0, Paid=1, Processing=2, Shipped=3, Delivered=4, Cancelled=5, Refunded=6`.
**Sepet:** başlık yok — `WixiCartItem` doğrudan `CustomerId`/`SessionId`'ye bağlı.

---

## İlgili Tablolar (ideal → mevcut)
| İdeal | Mevcut | Durum |
|---|---|---|
| ECOM_ORDERS | `WixiOrder` | 🟡 Var; breakdown/B2B/zaman damgaları/not eksik |
| ECOM_ORDER_ITEMS | `WixiOrderItem` | 🟡 Var; CostPrice/TaxRate/UnitName/DiscountAmount/ReturnedQty eksik |
| ECOM_CART_ITEMS | `WixiCartItem` | ✅ (ImageUrl → D-02) |
| ECOM_CARTS | — | ❌ Sepet başlığı yok (kupon/expire sepette tutulmuyor) |
| ECOM_PAYMENTS | `WixiPaymentLog` | 🟡 Iyzipay-log; yöntem/taksit/iade alanları dar |
| ECOM_DISCOUNTS | `WixiCoupon` | ✅ |

## Bağımlılıklar
- **Girdi:** M01 Katalog (ürün/varyant/fiyat), M02 Müşteri / M04 Cari (sipariş sahibi), M07 Stok (rezervasyon), M00 (para birimi, incoterm).
- **Çıktı:** M02 RFM (sipariş geçmişi), M03 Sadakat (puan kazan/harca), M08 Kargo, M09 İade, M12 Finans (fatura), M13 Raporlama (ciro/kâr marjı).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** Genişletmeler `WixiOrder`/`WixiOrderItem` üzerinde; DbSet zaten `ECommerceDbContext`'te. Migration `ECommerce/Migrations/Tenant/` (idempotent).

#### 1.1. `WixiOrder` genişletmesi
```
// Fiyat breakdown (TotalAmount tek başına yetmez — fatura/kâr/rapor için)
+ SubTotal        decimal
+ DiscountAmount  decimal
+ ShippingAmount  decimal
+ TaxAmount       decimal
// (TotalAmount mevcut kalır = SubTotal - Discount + Shipping + Tax)

// Kaynak & kanal
+ CariId          Guid?     // B2B siparişi (M04, D-07) — null ise B2C
+ Channel         enum { Web, Mobile, Phone, StoreAdmin, Marketplace }

// İndirim & sadakat snapshot
+ CouponCode         string?
+ LoyaltyPointsUsed  int
+ LoyaltyDiscount    decimal

// Adres snapshot (string yerine yapısal — müşteri adresi değişse sipariş etkilenmez)
+ ShipToName/Phone/Address/City/District/Country/ZipCode
+ BillToName/TaxNumber/TaxOfficeName/Address/City   // kurumsal fatura

// B2B lojistik snapshot (M00 referans string kopya, D-03)
+ IncotermCode/TransportMode/LoadingPort/DischargePort  string?

// Durum zaman damgaları (RFM recency, SLA, kargo için ZORUNLU)
+ ConfirmedAt/PreparedAt/ShippedAt/DeliveredAt/CancelledAt  DateTime?
+ CancelReason   string?
+ OrderNote      string?    // müşteri notu
+ AdminNote      string?    // iç not
```
> **Not:** `TrackingNumber`/`ShippingProvider` mevcut `WixiOrder`'da → M08'de `WixiCargoShipment`'a taşınır (sipariş çoklu gönderi olabilir). Geçişte geriye dönük korunur.

#### 1.2. `WixiOrderItem` genişletmesi
```
+ CostPrice       decimal    // sipariş anı maliyet snapshot → kâr marjı (M13)
+ TaxRate         decimal
+ UnitName        string?    // 'adet','kg' (M00 kopya)
+ DiscountAmount  decimal
+ ReturnedQty     int        // iade edilen miktar (M09 RMA)
```

#### 1.3. Sepet başlığı kararı — `WixiCart` (öneri)
Mevcut: başlıksız, item'lar `CustomerId`/`SessionId`'ye bağlı. Kupon checkout'ta uygulanıyor.
> **Açık soru O-O1:** Sepet başlığı (`WixiCart`: CouponCode, DiscountAmount, ExpiresAt) eklensin mi? **Öneri:** **Eklensin** — terk edilen sepet kampanyası (M11), kupon-sepette-sakla, 30 gün expire temizliği için gerekli. Mevcut item'lar `CartId`'ye bağlanır.

#### 1.4. `WixiPayment` genişletmesi (mevcut `WixiPaymentLog`)
```
+ PaymentMethod    enum { CreditCard, BankTransfer, CashOnDelivery, Wallet, BNPL }
+ InstallmentCount int
+ RefundedAmount   decimal
+ PaidAt/RefundedAt DateTime?
// Provider zaten var (Iyzipay/Stripe); çoklu provider destekleniyor
```

---

### 2. Sipariş Durum Makinesi

Mevcut enum yeterli; **geçiş kuralları + zaman damgası + yan etki** netleştirilir:

| Geçiş | Tetik | Yan etki |
|---|---|---|
| Pending → Paid | Ödeme callback başarılı | `PaidAt`, stok rezervasyonu kesinleşir (M07), puan kazanma kuyruğa (M03) |
| Paid → Processing | Store-admin hazırlık | `ConfirmedAt/PreparedAt` |
| Processing → Shipped | Kargo oluştur (M08) | `ShippedAt`, `WixiCargoShipment` |
| Shipped → Delivered | Kargo teslim | `DeliveredAt` → **RFM tetik (M02), puan kesinleşir (M03)** |
| * → Cancelled | İptal | `CancelledAt`, `CancelReason`, stok iade (M07), puan geri al (M03) |
| Delivered → Refunded | İade tamamlandı (M09) | `RefundedAt`, ödeme iadesi |

> **Açık soru O-O2:** Durum geçişleri serbest mi, kurallı state machine mi? **Öneri:** kurallı — `UpdateOrderStatusCommand` geçerli geçişi doğrular (örn. Delivered'dan Pending'e dönülemez).

---

### 3. CQRS (`Application/Orders/`, `Application/Cart/`)

**Mevcut korunur, genişletilir:**
| Var | Değişiklik |
|---|---|
| `CreateOrderCommand` | breakdown hesapla, adres snapshot al, B2B (CariId) destekle, Channel set et |
| `UpdateOrderStatusCommand` | geçiş doğrulama + zaman damgası + MediatR event yayınla (RFM/puan/stok için) |
| `InitiatePayment`/`HandlePaymentCallback` | PaymentMethod/InstallmentCount kaydet |
| `GetOrders`/`GetOrderById` | breakdown + zaman damgaları + B2B alanlarını döndür |

**Yeni:**
| Komut/Sorgu | İş |
|---|---|
| `AddOrderNoteCommand` | Admin notu (AdminNote) |
| `RefundPaymentCommand` | Kısmi/tam iade (M09 ile) |
| `GetCartQuery` / sepet başlığı | `WixiCart` eklenirse kupon+toplam döndür |
| `GetSalesReportQuery` | Ciro/kâr marjı özeti (M13'e taşınabilir) |

> **MediatR event'leri (D-04 modüller arası iletişim):** `OrderDeliveredEvent` → M02 RFM + M03 puan; `OrderCancelledEvent` → M07 stok + M03 puan geri al. Doğrudan çağrı değil, event.

---

### 4. Endpoint'ler (mevcut + genişletme)

| Metot | Route | Durum |
|---|---|---|
| GET/POST/PUT/DELETE | `/public/storefront/cart` (+items) | ✅ (sepet başlığı eklenirse genişler) |
| POST · GET my · GET {orderNumber} | `/public/storefront/orders` | ✅ (B2B/breakdown alanları döner) |
| POST initiate · POST callback | `/public/storefront/payment` | ✅ |
| POST | `/webhooks/stripe` | ✅ |
| GET · GET{id} · PATCH{id}/status | `/store-admin/orders` | 🟡 genişlet (note/refund + 360 detay) |
| POST | `/store-admin/orders/{id}/note` | ❌ yeni |
| POST | `/store-admin/orders/{id}/refund` | ❌ yeni (M09 ile) |
| GET | `/store-admin/payments` | ✅ |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| `StorefrontCartPage` / `CheckoutPage` | 🟡 | breakdown göster (ara toplam/indirim/kargo/vergi), kupon, puan kullan |
| Store-admin sipariş listesi/detay | 🟡 genişlet | breakdown + durum zaman çizelgesi + adres snapshot + admin not + iade butonu (`Modal`) |
| `StorePaymentsPage` | ✅ | ödeme logları |

> Zorunlu shared UI; iade/not onayı `Modal`. Sepet `ImageUrl` → D-02 relativePath.

---

## Açık Sorular
- **O-O1** Sepet başlığı `WixiCart` eklensin mi? → öneri: **evet** (terk sepet, kupon-sakla, expire).
- **O-O2** Durum geçişleri kurallı state machine mi? → öneri: **evet**.
- **O-O3** `WixiOrder` adres snapshot string→yapısal migration: mevcut string siparişler nasıl taşınır? (parse/koru)
- B2B sipariş (CariId) akışı storefront'tan mı, sadece store-admin'den mi başlar?

## Detay Tasarım (TODO)
- [x] Veri modeli + durum makinesi + CQRS + endpoint + frontend tasarımı
- [ ] `WixiOrder` genişletme migration (breakdown, B2B, zaman damgaları, adres snapshot, not)
- [ ] `WixiOrderItem` genişletme (CostPrice, TaxRate, DiscountAmount, ReturnedQty)
- [ ] Sepet başlığı `WixiCart` kararı + (kabulse) entity + item bağı
- [ ] `WixiPaymentLog` → ödeme genişletme (yöntem/taksit/iade)
- [ ] `UpdateOrderStatusCommand` geçiş doğrulama + zaman damgası + MediatR event
- [ ] `OrderDeliveredEvent` / `OrderCancelledEvent` (M02/M03/M07 tüketir)
- [ ] Endpoint: order note, refund
- [ ] Frontend: store-admin sipariş detay genişletme (breakdown + zaman çizelgesi)
- [ ] `WixiCartItem.ImageUrl` → relativePath (D-02)
