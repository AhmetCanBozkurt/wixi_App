# M08 — Kargo & Teslimat

> **Durum:** 🟡 Provider iskeleti var, veri modeli yok · **Faz:** 3 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Çoklu kargo firma entegrasyonu, gönderi + etiket, takip, SLA, gecikme uyarısı, maliyet bazlı otomatik firma seçimi.

---

## Mevcut Durum (kodda ne var)

| Var | İçerik |
|---|---|
| `Application/Cargo/ICargoProvider.cs` | **Strategy interface:** `ProviderName, ProviderCode, TrackAsync(), GetRateAsync()` + record'lar (`CargoTrackingResult`, `CargoRateRequest/Result`) |
| `Infrastructure/Cargo/YurticiCargoProvider.cs` | `ProviderCode="yurtici"` — **stub** (placeholder döndürüyor) |
| `Infrastructure/Cargo/ArasCargoProvider.cs` | `ProviderCode="aras"` — stub |
| `ECommerceModuleExtensions` | `IEnumerable<ICargoProvider>` DI kayıtlı |
| `WixiOrder` | `TrackingNumber`, `ShippingProvider` (inline — geçici) |

**Yani:** API adaptör katmanı (strategy) iskeleti hazır ama gerçek implementasyon stub. **Veri modeli yok:** firma kataloğu, ayar/anahtar, gönderi takip kaydı — hiçbiri yok.

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Durum |
|---|---|---|
| CARGO_CARRIERS (katalog) | `WixiCargoCarrier` (Master/Core) | ❌ D-01 |
| CARGO_CARRIERS (ayar+key) | `WixiCargoCarrierSetting` (Per-tenant) | ❌ D-01 |
| CARGO_SHIPMENTS | `WixiCargoShipment` (Per-tenant) | ❌ |

> **✅ Mimari karar D-01 (2026-06-14):** Kargo firmaları ikiye bölünür:
> - **Master `WixiCargoCarrier`** — platform geneli firma kataloğu (Code/Name/LogoRelativePath/TrackingUrlTemplate). API anahtarı yok. (Logo→D-02; TrackingUrl→D-02 dış link istisnası)
> - **Per-Tenant `WixiCargoCarrierSetting`** — mağazanın açtığı firmalar + şifreli ApiKey/Secret/CustomerCode + SLA. `CarrierCode` ile master'a string-kopya bağlanır (çapraz-DB FK yok).

## Bağımlılıklar
- **Girdi:** M00 (kargo katalog — D-01), M06 Sipariş (gönderilecek sipariş + adres snapshot).
- **Çıktı:** M09 İade (iade kargosu/etiketi), M13 Raporlama (kargo performansı/SLA), M02 (müşteriye takip bildirimi).

---

## Detay Tasarım

### 1. Veri Modeli

#### 1.1. `WixiCargoCarrier` — MASTER katalog (Core, D-01)
```
Id, Code (yurtici|aras|mng|ptt|dhl|ups)   // ICargoProvider.ProviderCode ile EŞLEŞİR
Name, NameEn
LogoRelativePath          // D-02 dosya
TrackingUrlTemplate       // D-02 dış link istisnası ({trackingNo})
IsInternational, SortOrder, IsActive
+ IAuditable
```
> Frontend/endpoint mevcut referans pattern'i (M00): `Controllers/ReferenceData/CargoCarriersController` + `DefinitionsPage/CargoCarriersPage`. **Code, ICargoProvider.ProviderCode ile aynı string** → adaptör çözümlemesi.

#### 1.2. `WixiCargoCarrierSetting` — PER-TENANT (ECommerce, D-01)
```
Id, CarrierCode (master'dan string kopya)
ApiKey, ApiSecret, CustomerCode   // şifreli (mevcut şifreleme altyapısı)
DefaultDays, SlaDays
IsDefault, IsActive
+ IAuditable
```
> Sadece açık (`IsActive`) ayarı olan firmalar mağazada seçilebilir.

#### 1.3. `WixiCargoShipment` — PER-TENANT (gönderi takip)
```
Id, OrderId (FK), CarrierCode (hangi firma)
TrackingNumber, LabelRelativePath   // D-02: PDF etiket dosyası
Status enum { Pending, Created, PickedUp, InTransit, OutForDelivery, Delivered, Failed, Returned }
EstimatedDate, ActualDate, SlaDays, SlaBreached (bool)
LastTracked DateTime?
TrackingEvents string   // JSON: firma event listesi
FailureReason string?
+ IAuditable
```
> Bir sipariş **çoklu gönderi** olabilir (kısmi teslimat). `WixiOrder.TrackingNumber/ShippingProvider` (M06) → buraya taşınır; geçişte geriye dönük korunur.

---

### 2. Adaptör Entegrasyonu (mevcut `ICargoProvider` üzerine)

| İhtiyaç | Mevcut | İş |
|---|---|---|
| Takip | `TrackAsync()` (stub) | Gerçek API implementasyonu (Yurtiçi/Aras önce) |
| Ücret | `GetRateAsync()` (stub) | Gerçek tarife → otomatik firma seçimi |
| Etiket | — | `CreateShipmentAsync()` interface'e eklenir (tracking no + PDF etiket döner) |

> **Adaptör çözümleme:** `ProviderCode` (yurtici) → `WixiCargoCarrier.Code` → tenant `WixiCargoCarrierSetting` (ApiKey). Provider, ayardan anahtarı alır.
> **Otomatik firma seçimi:** sipariş kargolanırken açık tüm firmaların `GetRateAsync` sonucu → en ucuz/hızlı seçilir (kural store-admin ayarı).

### 3. Takip & SLA (BackgroundService, D-06)

`CargoTrackingWorker` — periyodik `InTransit`/`Created` gönderileri `TrackAsync` ile günceller, `TrackingEvents` ekler, teslim olunca `Status=Delivered` + **M06 sipariş `Shipped→Delivered`** (event). `now > EstimatedDate + SlaDays` → `SlaBreached=true` + uyarı.

---

### 4. CQRS (`Application/Cargo/`)

| Komut/Sorgu | İş |
|---|---|
| `UpsertCarrierSettingCommand` | Tenant kargo firma ayarı (API key) |
| `CreateShipmentCommand` | Sipariş için gönderi oluştur (adaptör → tracking + etiket) |
| `RefreshTrackingCommand` | Manuel takip güncelle |
| `GetShipmentsQuery` / `GetShipmentByOrderQuery` | Gönderi listesi/detay |
| `GetCarrierRatesQuery` | Sipariş için firma ücret karşılaştırma (otomatik seçim) |
| `GetSlaReportQuery` | SLA ihlal raporu (M13) |

---

### 5. Endpoint'ler

| Katman | Metot | Route |
|---|---|---|
| Master (platform admin) | GET/POST/PUT/DELETE | `/ref/cargo-carriers` (M00 — katalog) |
| Store-admin | GET/POST/PUT | `/store-admin/cargo/settings` (firma+key) |
| Store-admin | POST · GET · GET{orderId} | `/store-admin/cargo/shipments` |
| Store-admin | POST{id}/refresh-tracking · GET rates | `/store-admin/cargo/...` |
| Storefront | GET{orderNumber}/tracking | `/public/storefront/orders/{n}/tracking` (müşteri takip) |

---

### 6. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| `CargoCarriersPage` (admin katalog) | ❌ yeni (M00) | Master firma kataloğu CRUD |
| Store-admin kargo ayarları | ❌ yeni | Firma seç + API key gir (`ImageUploadField` yok; key `Input`) |
| Store-admin gönderiler | ❌ yeni | Sipariş→gönderi oluştur, etiket indir, takip durumu |
| Storefront takip | ❌ yeni | Sipariş takip linki + durum zaman çizelgesi |

---

## Açık Sorular
- **O-K1:** İlk gerçek implementasyon hangi firma? → öneri: Yurtıçi + Aras (adaptör zaten var, stub'ları doldur).
- **O-K2:** Etiket PDF master `TrackingUrlTemplate` yeterli mi, yoksa firma API'sinden mi üretilir? → API'den (`CreateShipmentAsync`).
- **O-K3:** Otomatik firma seçimi mi, müşteri/admin seçimi mi? → öneri: ikisi (varsayılan oto, override mümkün).

## Detay Tasarım (TODO)
- [ ] `WixiCargoCarrier` master entity + ReferenceData controller + DefinitionsPage (M00 — bkz M00 spec)
- [ ] `WixiCargoCarrierSetting` per-tenant entity (şifreli key)
- [ ] `WixiCargoShipment` entity + DbSet + migration
- [ ] `ICargoProvider`'a `CreateShipmentAsync()` ekle + Yurtıçi/Aras gerçek implementasyon
- [ ] Adaptör çözümleme: ProviderCode ↔ Carrier.Code ↔ Setting (ApiKey)
- [ ] `CargoTrackingWorker` (BackgroundService, D-06) + SLA ihlal
- [ ] M06 entegrasyon: shipment oluşunca `Shipped`, teslim olunca `Delivered` event
- [ ] CQRS + endpoint'ler (settings, shipments, tracking, rates)
- [ ] Frontend: kargo ayarları + gönderiler + storefront takip
- [ ] `WixiOrder.TrackingNumber/ShippingProvider` → `WixiCargoShipment` geçişi (M06 ile)
