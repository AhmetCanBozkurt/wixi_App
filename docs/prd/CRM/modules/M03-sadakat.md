# M03 — Sadakat & Ödül

> **Durum:** 🟡 Kısmi · **Faz:** 1 · **Öncelik:** 🟠 Yüksek · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Puan kazanma/harcama programı, üyelik kademeleri (Bronze/Silver/Gold/Platinum), puan sona erme (expiry), referans (davet) programı. **Hareket altyapısı mevcut**; program ayarları, denormalize bakiye, kademe motoru ve frontend eksik.

---

## Mevcut Durum (kodda ne var)

| Dosya | İçerik |
|---|---|
| `Domain/Entities/WixiLoyaltyPoint.cs` | Hareket entity'si + `enum LoyaltyPointType { Earned=1, Spent=2, Expired=3, Adjusted=4 }` |
| `Application/Loyalty/AddLoyaltyPointsCommand.cs` | Puan hareketi ekler (`Points = Math.Abs(...)`, tür ayrı alanda) |
| `Application/Loyalty/GetLoyaltyBalanceQuery.cs` | Bakiyeyi **anlık hesaplar** (Earned/Adjusted +, Spent/Expired −) + son 20 hareket |
| `ECommerceDbContext.LoyaltyPoints` | DbSet kayıtlı |

**Mevcut `WixiLoyaltyPoint` alanları:** `Id, CustomerId, Type, Points, Description, ReferenceOrderId, CreatedAt, IsActive, IsDeleted` (+IAuditable).

**Eksik olan:** Puan kuralı/kademe konfigürasyonu, denormalize bakiye (her sorguda tüm hareketleri toplamak ölçeklenmiyor), puan sona erme tarihi (hareket bazlı expiry), kademe hesabı, referans programı, sipariş→puan otomasyonu, hiçbir controller/endpoint, hiçbir ekran.

---

## İlgili Tablolar (ideal → mevcut)
| İdeal | Mevcut Entity | Durum |
|---|---|---|
| LYL_POINT_TRANSACTIONS | `WixiLoyaltyPoint` | 🟡 Var ama `ExpiresAt`, `ExpiredFromId`, `Balance` snapshot yok |
| LYL_PROGRAMS | — | ❌ Puan kuralı/kademe eşik ayarları yok |
| LYL_CUSTOMER_POINTS | — | ❌ Denormalize bakiye + kademe tablosu yok |
| LYL_REFERRALS | — | ❌ Referans/davet programı yok |

## Bağımlılıklar
- **Girdi:** M02 Müşteri (puan sahibi `CustomerId`), M06 Sipariş (puan kazanma/harcama tetiği; `OrderStatus`).
- **Çıktı:** M02 (müşteri 360° kartında puan/kademe rozeti), M13 Raporlama (program ROI, kademe dağılımı), M11 Pazarlama (kademeye göre segment).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** Tüm entity'ler `Wixi.Modules.ECommerce/Domain/Entities/`, DbSet `ECommerceDbContext`'e eklenir, mevcut `ECommerceTenantProvisioner` otomatik migrate eder. `Wixi*` prefix.

#### 1.1. `WixiLoyaltyProgram` (program konfigürasyonu — tenant başına tek satır)
```
Id, IsEnabled (bool)
PointsPerAmount      decimal  // 1 puan = kaç TL harcama (ör. 10 → 10 TL = 1 puan)
PointValueInCurrency decimal  // 1 puan harcanınca kaç TL indirim (ör. 0.10)
MinRedeemPoints      int      // min harcanabilir puan (ör. 100)
MaxRedeemPercent     int      // sipariş tutarının max %'i puanla ödenebilir (ör. 30)
PointsExpiryMonths   int?     // kazanılan puan kaç ay sonra yanar (null = süresiz)
EarnOnStatus         OrderStatus  // hangi statüde puan yazılır (varsayılan Delivered=4)
RoundingMode         enum { Floor, Round, Ceil }
ReferralEnabled      bool
ReferrerBonusPoints  int      // davet eden bonusu
RefereeBonusPoints   int      // davet edilen bonusu
+ IAuditable
```
> **Açık soru O-L1:** Kademe eşikleri ayrı tablo mu (`WixiLoyaltyTier`) yoksa bu entity'de JSON kolon mu? **Öneri:** ayrı `WixiLoyaltyTier` tablosu — UI'dan satır ekle/çıkar yönetimi temiz, sorgulanabilir.

#### 1.2. `WixiLoyaltyTier` (kademe tanımları — tenant başına N satır)
```
Id, ProgramId (FK)
Name              string   // Bronze / Silver / Gold / Platinum
NameEn            string
MinPoints         int      // bu kademeye giriş eşiği (yıllık kazanılan puan)
EarnMultiplier    decimal  // bu kademede puan çarpanı (ör. Gold 1.5x)
DiscountPercent   int      // kademeye özel sürekli indirim (opsiyonel)
BadgeColor        string   // UI rozet rengi (#hex)
SortOrder         int
+ IAuditable
```

#### 1.3. `WixiCustomerPoints` (denormalize bakiye — müşteri başına tek satır)
```
Id, CustomerId (FK, unique)
CurrentPoints    int      // anlık kullanılabilir bakiye
TotalEarned      int      // ömür boyu kazanılan
TotalRedeemed    int      // ömür boyu harcanan
TotalExpired     int
CurrentTierId    Guid?    // FK WixiLoyaltyTier
PointsThisYear   int      // kademe hesabı için yıllık kazanım
NextExpiryDate   DateTime?// en yakın yanacak puan tarihi (hatırlatma için)
NextExpiryPoints int
+ IAuditable
```
> **Karar O-L2 → öneri:** Bakiye **denormalize** tutulur (mevcut "her sorguda topla" yaklaşımı 10K+ harekette yavaşlar). `WixiLoyaltyPoint` her yazıldığında `WixiCustomerPoints` aynı transaction'da güncellenir. `GetLoyaltyBalanceQuery` artık tek satır okur.

#### 1.4. `WixiLoyaltyPoint` genişletmesi (mevcut entity'ye eklenecek)
```
+ ExpiresAt       DateTime?  // Earned hareketler için yanma tarihi
+ RemainingPoints int        // FIFO harcama için bu lottan kalan (Earned'da kullanılır)
+ ExpiredFromId   Guid?      // Expired hareketin hangi Earned lottan geldiği (iz)
```
> FIFO mantığı: harcama/yanma en eski `Earned` lotundan düşer (`RemainingPoints` azaltılır). Bu, doğru expiry için zorunlu.

#### 1.5. `WixiLoyaltyReferral` (referans programı)
```
Id, ReferrerCustomerId (FK), RefereeCustomerId (FK, nullable until claimed)
ReferralCode     string   // davet eden için üretilen kod
Status           enum { Pending, Completed, Rewarded }
RefereeFirstOrderId Guid? // ödülün tetiklendiği ilk sipariş
RewardedAt       DateTime?
+ IAuditable
```

---

### 2. İş Kuralları Motoru (`LoyaltyEngine` — Infrastructure/Services)

| Kural | Mantık |
|---|---|
| **Puan kazanma** | `points = RoundingMode( orderTotal / PointsPerAmount * tier.EarnMultiplier )`. Sadece `EarnOnStatus`'a ulaşınca. İade/iptalde geri alınır (negatif `Adjusted`). |
| **Puan harcama** | Sepette: `maxRedeemable = min( customer.CurrentPoints, floor(orderTotal * MaxRedeemPercent/100 / PointValueInCurrency) )`. `< MinRedeemPoints` ise harcama kapalı. |
| **Kademe geçişi** | `PointsThisYear >= tier.MinPoints` olan en yüksek kademe atanır. Yılda bir sıfırlama (job) veya kayan 12 ay (karar O-L3). |
| **Expiry (FIFO)** | `ExpiresAt <= now` olan `Earned` lotların `RemainingPoints`'i `Expired` hareketine dönüşür; bakiyeden düşülür. |
| **Referans** | Davet edilen ilk siparişini `EarnOnStatus`'a getirince: davet edene `ReferrerBonusPoints`, edilene `RefereeBonusPoints` `Earned` yazılır. |

> **Idempotency:** Sipariş→puan event'i `ReferenceOrderId` ile tekilleştirilir — aynı sipariş için ikinci kez `Earned` yazılmaz (event retry'a karşı).

---

### 3. CQRS (Application/Loyalty/)

**Commands**
| Komut | İş |
|---|---|
| `UpsertLoyaltyProgramCommand` | Program ayarlarını kaydet (store-admin) |
| `UpsertLoyaltyTierCommand` / `DeleteLoyaltyTierCommand` | Kademe CRUD |
| `EarnPointsForOrderCommand` | Sipariş için puan yaz (engine + bakiye güncelle, idempotent) — **event handler çağırır** |
| `RedeemPointsCommand` | Sepette/siparişte puan harca (FIFO düş, bakiye güncelle) |
| `AdjustPointsCommand` | Manuel +/− düzeltme (store-admin, sebep zorunlu) — *mevcut `AddLoyaltyPointsCommand` bununla değiştirilir/sarmalanır* |
| `ReverseOrderPointsCommand` | İade/iptalde kazanılan puanı geri al |
| `CreateReferralCodeCommand` / `ClaimReferralCommand` | Referans kodu üret / kullan |

**Queries**
| Sorgu | İş |
|---|---|
| `GetLoyaltyProgramQuery` | Program + kademeler (store-admin ayar ekranı, storefront kuralları göster) |
| `GetCustomerLoyaltyQuery` | Bakiye + kademe + ilerleme + son hareketler — *mevcut `GetLoyaltyBalanceQuery` bunun yerini alır/genişler* |
| `GetRedeemableQuery(customerId, orderTotal)` | Sepet için max harcanabilir puan + TL karşılığı |
| `GetLoyaltyLedgerQuery(customerId, paged)` | Tam hareket geçmişi (sayfalı, store-admin) |
| `GetLoyaltyOverviewQuery` | Program ROI: toplam dağıtılan/harcanan/yanan puan, kademe dağılımı (store-admin dashboard) |

---

### 4. API Endpoint'leri

> Rota kalıbı mevcut controller'larla aynı: store-admin → `api/v1/store-admin/...` (TenantAdmin auth), storefront → `api/v1/public/storefront/...` (müşteri `Bearer`).

#### 4.1. Store-Admin (`Controllers/StoreAdmin/StoreLoyaltyController.cs`)
| Method | Route | İş |
|---|---|---|
| GET | `/api/v1/store-admin/loyalty/program` | Program + kademeleri getir |
| PUT | `/api/v1/store-admin/loyalty/program` | Program ayarlarını kaydet |
| POST | `/api/v1/store-admin/loyalty/tiers` | Kademe ekle |
| PUT | `/api/v1/store-admin/loyalty/tiers/{id}` | Kademe güncelle |
| DELETE | `/api/v1/store-admin/loyalty/tiers/{id}` | Kademe sil |
| GET | `/api/v1/store-admin/loyalty/overview` | Program ROI / kademe dağılımı |
| GET | `/api/v1/store-admin/loyalty/customers/{customerId}` | Müşteri bakiye + ledger (sayfalı) |
| POST | `/api/v1/store-admin/loyalty/customers/{customerId}/adjust` | Manuel puan +/− (sebep zorunlu) |

#### 4.2. Storefront / Müşteri (`Controllers/Storefront/StorefrontLoyaltyController.cs`, `[Authorize(Bearer)]`)
| Method | Route | İş |
|---|---|---|
| GET | `/api/v1/public/storefront/loyalty/me` | Kendi bakiye + kademe + ilerleme + son hareketler |
| GET | `/api/v1/public/storefront/loyalty/rules` | Program kuralları (puan oranı, kademeler) — herkese açık |
| GET | `/api/v1/public/storefront/loyalty/redeemable?orderTotal=` | Sepet için harcanabilir puan |
| POST | `/api/v1/public/storefront/loyalty/referral` | Kendi davet kodunu al/oluştur |

> **Puan kazanma/harcama endpoint'i yok** — kazanma sipariş statü event'iyle otomatik (§5), harcama `CreateOrderCommand`/checkout içinde `RedeemPointsCommand` ile gömülü tetiklenir.

---

### 5. Sipariş Entegrasyonu (MediatR Event — D-06)

Puan kazanımı manuel değil, **sipariş statü değişiminde otomatik** tetiklenir. Mevcut `UpdateOrderStatusCommandHandler` (puan tetikleyicisi olmayan) genişletilir:

```
UpdateOrderStatusCommand → status == program.EarnOnStatus (varsayılan Delivered)
  → Publish OrderReachedEarnStatusEvent(orderId, customerId, total)   // INotification
     → EarnPointsForOrderCommand (idempotent: ReferenceOrderId kontrolü)
     → ilk sipariş + referans varsa ClaimReferral ödülü
  → status == Cancelled/Refunded
     → ReverseOrderPointsCommand (kazanılmışsa geri al)
```
> **Neden event:** Sipariş ile loyalty gevşek bağlı kalır (CLAUDE.md: modüller arası MediatR event). Harcama tarafı checkout'a gömülü olduğundan komut; kazanma asenkron olduğundan event.

---

### 6. Arka Plan Job (`LoyaltyExpiryBackgroundWorker` — D-06)

Mevcut `BackgroundService` pattern'i (`TcmbSyncBackgroundWorker` örneği): günde 1 kez `CreateScope` ile:
1. `ExpiresAt <= now` ve `RemainingPoints > 0` olan `Earned` lotları bul → `Expired` hareketi yaz, bakiye düş.
2. `NextExpiryDate` 7 gün içinde olan müşterilere hatırlatma maili (`IMailQueue` + Scriban şablonu).
3. Kademe yıllık sıfırlama (karar O-L3'e göre yıl sonu veya kayan pencere).

---

### 7. Frontend Ekranları

#### 7.1. Store-Admin (`pages/store-admin/StoreLoyaltyPage/`)
| Ekran/Sekme | İçerik | Shared UI |
|---|---|---|
| **Program Ayarları** | Puan oranı, puan değeri, min/max harcama, expiry ay, kazanma statüsü, yuvarlama | `Input`, `Select`, `Switch`, `Button` |
| **Kademeler** | Bronze/Silver/Gold/Platinum tablo + ekle/düzenle modalı (ad, eşik, çarpan, indirim, renk) | `AdvancedDataTable`, `Modal`, `Input` |
| **Genel Bakış** | Dağıtılan/harcanan/yanan puan kartları, kademe dağılım grafiği | kart + chart |
| **Müşteri Puan Detayı** | (M02 müşteri 360° kartı içinde panel) bakiye, kademe rozeti, ledger, manuel +/− modalı | `Modal`, `Badge`, tablo |

> **CLAUDE.md zorunlu:** ham `<input>/<select>/<button>` yasak — `Input/Select/Switch/Button/Modal/AdvancedDataTable` kullanılacak. Silme/ayar onayı `Modal` ile.

#### 7.2. Storefront / Müşteri (`pages/storefront/`)
| Ekran | İçerik |
|---|---|
| **Puanlarım** (Customer Portal sekmesi) | Bakiye, kademe rozeti + bir sonraki kademeye ilerleme bar'ı, hareket geçmişi, davet kodu paylaş |
| **Sepet/Checkout** | "X puanım var, Y TL indirim kullan" toggle + canlı tutar güncelleme (`redeemable` endpoint) |
| **Program Tanıtım** | Kurallar + kademe avantajları (giriş yapmamış ziyaretçiye `rules` endpoint) |

---

### 8. Migration & Veri Geçişi
- Yeni tablolar: `WixiLoyaltyProgram`, `WixiLoyaltyTier`, `WixiCustomerPoints`, `WixiLoyaltyReferral` + `WixiLoyaltyPoint` 3 yeni kolon.
- Migration **idempotent** (CLAUDE.md kuralı: `IF OBJECT_ID(...) IS NULL`), `Infrastructure/Data/Migrations/`.
- **Backfill:** mevcut `WixiLoyaltyPoint` hareketlerinden müşteri başına `WixiCustomerPoints` bakiyesi tek seferlik hesaplanıp yazılır (migration sonrası seed/job).
- **Seed:** yeni tenant provision'da varsayılan program (kapalı) + 4 standart kademe (Bronze 0 / Silver 500 / Gold 2000 / Platinum 5000).

---

### 9. Test / Doğrulama Senaryoları
1. 1000 TL sipariş `Delivered` → `PointsPerAmount=10` ile 100 puan yazılır; `WixiCustomerPoints` 100 olur.
2. Aynı sipariş ikinci kez `Delivered` event'i → puan tekrar yazılmaz (idempotency).
3. Gold müşteri (1.5x) aynı siparişte 150 puan alır.
4. Müşteri 100 puanla 10 TL indirim kullanır → bakiye düşer, FIFO en eski lottan azalır.
5. `MaxRedeemPercent=30` → 100 TL siparişte max 30 TL puanla ödenir, fazlası reddedilir.
6. `ExpiresAt` geçmiş lot → job `Expired` yazar, bakiye düşer, hatırlatma maili gider.
7. Sipariş `Refunded` → kazanılan puan negatif `Adjusted` ile geri alınır.
8. Referans: davet edilen ilk siparişini tamamlar → iki tarafa bonus yazılır.

---

## Açık Sorular → ✅ KAPATILDI ([OPEN-QUESTIONS.md](../OPEN-QUESTIONS.md))
- **O-L1** ✅ Ayrı `WixiLoyaltyTier` tablo.
- **O-L2** ✅ Denormalize `WixiCustomerPoints`.
- **O-L3** ✅ **Ömür boyu kümülatif kademe** (kullanıcı kararı) — sıfırlama yok; `MinPoints` = ömür boyu `TotalEarned` eşiği; kademe düşmez. → `WixiCustomerPoints.PointsThisYear` **kaldırılır**, kademe `TotalEarned`'dan hesaplanır.
- **O-L4** ✅ **Toplam indirim** (kullanıcı kararı) — puan harcama tek indirim satırı → M06 `WixiOrder.LoyaltyDiscount`; kalem bazlı dağıtım yok.

## Uygulama Sırası (subtask önerisi)
1. Entity + migration + backfill (program, tier, customer-points, referral, point genişletme)
2. `LoyaltyEngine` + CQRS commands/queries
3. Sipariş event entegrasyonu (`UpdateOrderStatus` → earn/reverse)
4. Expiry background worker + hatırlatma maili
5. Store-admin endpoint + ekranlar (program/kademe/overview/müşteri detay)
6. Storefront endpoint + ekranlar (puanlarım, checkout redeem, referans)
