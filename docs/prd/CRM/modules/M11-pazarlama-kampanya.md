# M11 — Pazarlama & Kampanya

> **Durum:** ❌ Greenfield (newsletter hariç) · **Faz:** 4 · **Öncelik:** 🟠 Yüksek · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Pazarlama otomasyonu (terk sepet, doğum günü, yeniden satın alma, uyuyan aktivasyon), kampanya motoru, A/B testi, omnichannel gönderim, performans ölçümü.

---

## Mevcut Durum (kodda ne var)
| Var | İçerik |
|---|---|
| `WixiNewsletterSubscription` | `Email, SubscribedAt, IsActive` — basit abonelik |
| `Application/Newsletter/SubscribeNewsletterCommand` | Abone ekle |
| **Mail altyapısı (Core)** | `IMailQueue` → `MailingBackgroundWorker` → `IMailService` (MailKit) + `IMailTemplateEngine` (Scriban) + `WixiMailTemplate` |

> **Kampanya motoru yok** ama **mail gönderim altyapısı hazır** — M11 bunun üzerine kurulur (tekrar mail altyapısı yazılmaz).

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Durum |
|---|---|---|
| MKT_CAMPAIGNS | `WixiCampaign` (yeni) | ❌ |
| MKT_CAMPAIGN_RECIPIENTS | `WixiCampaignRecipient` (yeni) | ❌ |

## Bağımlılıklar
- **Girdi:** M02 Müşteri (RFM segment hedefleme, `EmailOptIn`/KVKK), M06 Sipariş (tetikleyici: terk sepet/post-purchase), M03 Sadakat (kademe hedefleme), M00 (mail template + altyapı).
- **Çıktı:** M02 `WixiCustomerCommLog` (gönderim logu), M13 (kampanya ROI).

---

## Detay Tasarım

### 1. Veri Modeli

#### 1.1. `WixiCampaign`
```
Id, Name
Type        enum { Manual, Triggered, ABTest }
TriggerType enum { AbandonedCart, Birthday, Reengagement, Welcome, PostPurchase, Custom }
Channel     enum { Email, SMS, Push, Multi }
TargetSegment string   // RFM segment (M02) veya 'All'
MailTemplateId Guid?   // WixiMailTemplate (M00)
Subject
Status      enum { Draft, Scheduled, Running, Paused, Completed, Cancelled }
ScheduledAt, StartedAt, CompletedAt  DateTime?
// İstatistik (denormalize, hız)
SentCount, OpenCount, ClickCount, ConversionCount  int
ConversionRevenue decimal
+ IAuditable
```

#### 1.2. `WixiCampaignRecipient`
```
Id, CampaignId (FK), CustomerId (FK)
Status enum { Queued, Sent, Failed, Bounced }
SentAt, OpenedAt, ClickedAt, ConvertedAt  DateTime?
ConversionAmount decimal
+ IAuditable (hafif)
```
> A/B testi: aynı kampanyada iki `MailTemplateId` varyantı; alıcılar bölünür, `OpenCount`/`ConversionCount` karşılaştırılır.

---

### 2. Tetikleyici Motoru (`CampaignTriggerWorker` — BackgroundService, D-06 + event)

| Tetik | Kaynak | Mantık |
|---|---|---|
| **AbandonedCart** | `WixiCart` (M06 O-O1) | X saat hareketsiz + sipariş yok → hatırlatma maili |
| **Birthday** | M02 `WixiCustomer.BirthDate` | Doğum günü sabahı kupon/kutlama |
| **Reengagement** | M02 RFM `Sleeping`/`AtRisk` | Aktivasyon kampanyası |
| **Welcome** | Yeni kayıt event | İlk hoş geldin + indirim |
| **PostPurchase** | M06 `OrderDeliveredEvent` | X gün sonra yeniden satın alma / yorum daveti |

> **Gönderim:** her tetik → `WixiCampaignRecipient` kuyruğa → `IMailQueue` (mevcut altyapı). KVKK: sadece `EmailOptIn=true` (M02) alıcılara. Açılma/tıklama tracking pixel + link redirect ile.
> **Idempotency:** tetik + müşteri + dönem tekilleştirilir (aynı doğum günü iki kez gönderilmez).

---

### 3. CQRS (`Application/Marketing/`)

| Komut | İş |
|---|---|
| `CreateCampaignCommand` / `UpdateCampaignCommand` | Kampanya tanımı |
| `ScheduleCampaignCommand` / `PauseCampaignCommand` | Zamanlama/duraklat |
| `SendCampaignNowCommand` | Manuel hemen gönder (segment → recipient → kuyruk) |
| `TrackOpenCommand` / `TrackClickCommand` / `TrackConversionCommand` | Pixel/redirect/sipariş eşleme |

| Sorgu | İş |
|---|---|
| `GetCampaignsQuery` / `GetCampaignByIdQuery` | Liste/detay + istatistik |
| `GetCampaignPerformanceQuery` | Açılma/tıklama/dönüşüm/ROI + A/B karşılaştırma |
| `GetSegmentRecipientCountQuery` | Segment kaç kişiye ulaşır (önizleme) |

> **Event (D-04):** Welcome ← `CustomerRegisteredEvent` (M02); PostPurchase ← `OrderDeliveredEvent` (M06).

---

### 4. Endpoint'ler

| Katman | Metot | Route |
|---|---|---|
| Store-admin | GET/POST/PUT · GET{id} | `/store-admin/campaigns` |
| Store-admin | POST{id}/schedule · /pause · /send-now | `/store-admin/campaigns/{id}/...` |
| Store-admin | GET{id}/performance | `/store-admin/campaigns/{id}/performance` |
| Public (tracking) | GET pixel · GET click redirect | `/public/track/{recipientId}/...` |
| Storefront | POST newsletter (mevcut) | `/public/storefront/newsletter` |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| Store-admin kampanya listesi | ❌ yeni | Liste + durum + temel istatistik |
| Kampanya oluşturucu | ❌ yeni | Tür/tetik/segment/template seç + zamanla + A/B + segment önizleme |
| Kampanya performans | ❌ yeni | Açılma/tıklama/dönüşüm/ROI grafiği |
| Kampanya takvimi | ❌ yeni | Flash sale/zamanlı kampanya takvim görünümü |

> Zorunlu shared UI; segment/template `Select`, A/B `Switch`.

---

## Açık Sorular
- **O-M1:** SMS/WhatsApp/Push sağlayıcı entegrasyonları hangi faz? → öneri: **e-posta önce** (altyapı hazır), SMS (Netgsm/İletiMerkezi) sonra.
- **O-M2:** Açılma/tıklama tracking pixel+redirect mi, harici (Mailchimp) mi? → öneri: kendi pixel/redirect (veri sahipliği).
- **O-M3:** Terk sepet için `WixiCart` başlığı (M06 O-O1) gerekli — M06'da karara bağlı.
- **O-M4:** Kupon motoru (M06 `WixiCoupon`) kampanyaya nasıl bağlanır? → kampanya kupon üretip alıcıya özel kod gönderebilir.

## Detay Tasarım (TODO)
- [ ] `WixiCampaign` + `WixiCampaignRecipient` entity + DbSet + migration
- [ ] `CampaignTriggerWorker` (BackgroundService, D-06) — 5 tetik tipi
- [ ] Event tüketici: `CustomerRegisteredEvent` (Welcome), `OrderDeliveredEvent` (PostPurchase)
- [ ] Mevcut `IMailQueue` altyapısı entegrasyonu + KVKK opt-in filtresi
- [ ] Tracking pixel/redirect + dönüşüm eşleme
- [ ] A/B test varyant yapısı
- [ ] CQRS (Application/Marketing/) + endpoint'ler
- [ ] Frontend: kampanya oluşturucu + performans + takvim
- [ ] (Bağımlı) M06 `WixiCart` başlığı — terk sepet için
