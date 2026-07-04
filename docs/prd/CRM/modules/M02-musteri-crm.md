# M02 — Müşteri & CRM Çekirdeği

> **Durum:** 🟡 İnce profil · **Faz:** 1 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
**Dökümanın asıl konusu.** Müşteri 360° profili, admin notları, RFM segmentasyonu, churn riski, KVKK izin yönetimi, iletişim logu. Mevcut `WixiCustomer` "ince" (sadece auth alanları) — bu modül onu CRM seviyesine taşır.

---

## Mevcut Durum (kodda ne var)

| Dosya | İçerik |
|---|---|
| `Domain/Entities/WixiCustomer.cs` | İnce: `FirstName, LastName, Email, PasswordHash, PhoneNumber, IsEmailVerified, Addresses[]` + IAuditable |
| `Domain/Entities/WixiAddress.cs` | `AddressType(Shipping/Billing), Title, Name, Phone, AddressLine, City, District, ZipCode, IsDefault` |
| `Application/Customers/` | `Register, Login, ForgotPassword, ResetPassword, UpdateCustomerProfile, GetCurrentCustomer` |
| `StorefrontAuthController` (`/public/storefront/auth`) | register · login · forgot-password · reset-password · PATCH profile · GET me |
| `StoreAdminCustomersController` (`/store-admin/customers`) | GET (liste) · GET{id} |
| Frontend | `StorefrontAccountPage` (müşteri self-servis), `StoreCustomersPage` (store-admin liste) |

**Eksik olan:** RFM/LTV/segment/churn, KVKK izin alanları, admin notu, iletişim logu, doğum günü/cinsiyet, profil foto, kara liste, 360° görünüm ekranı, segment filtreleri, hiçbir RFM job.

---

## İlgili Tablolar (ideal → mevcut)
| İdeal | Mevcut/Hedef Entity | Durum |
|---|---|---|
| ECOM_CUSTOMERS | `WixiCustomer` | 🟡 Genişletilecek (RFM/LTV/segment/KVKK/loyalty/profil alanları) |
| ECOM_CUSTOMER_ADDRESSES | `WixiAddress` | 🟡 Fatura alanları eksik (CompanyName/TaxNumber/TaxOffice) |
| CRM_CUSTOMER_NOTES | `WixiCustomerNote` (yeni) | ❌ |
| CRM_RFM_SNAPSHOTS | `WixiRfmSnapshot` (yeni) | ❌ |
| ECOM_CUSTOMER_COMM_LOGS | `WixiCustomerCommLog` (yeni) | ❌ |

## Bağımlılıklar
- **Girdi:** M06 Sipariş (RFM/LTV için `WixiOrder` geçmişi: CustomerId, TotalAmount, Status, CreatedAt), M00 (Region — adres).
- **Çıktı:** M03 Sadakat (puan sahibi), M05 Destek (talep sahibi), M11 Pazarlama (segment hedefleme), M13 Raporlama (cohort/churn).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** Tüm entity'ler `Wixi.Modules.ECommerce/Domain/Entities/`, CQRS `Application/Crm/`, DbSet `ECommerceDbContext`'e; mevcut `ECommerceTenantProvisioner` otomatik migrate. `Wixi*` prefix.

#### 1.1. `WixiCustomer` genişletmesi (mevcut entity'ye eklenecek)
```
// Kimlik / profil
+ BirthDate        DateTime?
+ Gender           enum { Unspecified, Male, Female, Other }
+ ProfileImagePath string?    // D-02: relativePath/varbinary (tam URL değil)
+ IsPhoneVerified  bool
+ IsGuest          bool       // NULL PasswordHash → misafir

// KVKK / izin yönetimi
+ EmailOptIn       bool
+ SmsOptIn         bool
+ PushOptIn        bool
+ KvkkConsentDate  DateTime?

// Segmentasyon (RFM job tarafından güncellenen denormalize alanlar)
+ RfmSegment       string?    // Loyal|Active|AtRisk|Sleeping|NewCustomer|LostChampion
+ LtvAmount        decimal    // yaşam boyu değer
+ TotalOrders      int
+ LastOrderDate    DateTime?

// Durum
+ IsBlacklisted    bool
+ BlacklistReason  string?
```
> **Loyalty alanları M02'de TUTULMAZ** — puan/kademe M03'ün `WixiCustomerPoints` tablosunda; 360° görünüm oradan okur (denormalizasyonu tek yerde tut, çift kayıt yok).

#### 1.2. `WixiAddress` genişletmesi (fatura adresi alanları)
```
+ CompanyName    string?   // kurumsal fatura
+ TaxNumber      string?
+ TaxOfficeName  string?   // REF_TAX_OFFICES'tan string kopya (D-03)
```

#### 1.3. `WixiCustomerNote` (CRM admin notu)
```
Id, CustomerId (FK)
NoteType    enum { General, Complaint, VIP, Followup, Blacklist }
Content     string (2000)
IsPrivate   bool          // sadece adminler görür (storefront'a sızmaz)
CreatedByUser string      // hangi admin
+ IAuditable
```

#### 1.4. `WixiRfmSnapshot` (günlük RFM hesap sonucu)
```
Id, CustomerId (FK), SnapshotDate (date)
RecencyDays     int       // son siparişten bu yana gün
FrequencyCount  int       // toplam sipariş sayısı
MonetaryAmount  decimal   // toplam harcama
RScore, FScore, MScore  int (1-5)
Segment         string
LtvAmount       decimal
AvgOrderValue   decimal
UNIQUE (CustomerId, SnapshotDate)
```
> Snapshot tarihsel trend için saklanır (cohort/churn — M13). Müşteri kartındaki anlık değerler `WixiCustomer`'daki denormalize alanlardan okunur.

#### 1.5. `WixiCustomerCommLog` (iletişim geçmişi)
```
Id, CustomerId (FK)
Channel    enum { Email, SMS, Push, WhatsApp }
Direction  enum { Outbound, Inbound }
Subject, Content
Status     enum { Sent, Delivered, Failed, Read }
CampaignId Guid?         // M11 ile ilişki
SentAt, ReadAt  DateTime?
```

---

### 2. RFM Hesaplama Motoru (`RfmSnapshotWorker` — BackgroundService, D-06)

Günlük çalışır (mevcut `MailingBackgroundWorker` pattern'i: `ExecuteAsync` + `CreateScope` + `Task.Delay`).

| Adım | Mantık |
|---|---|
| **Recency** | `now - MAX(WixiOrder.CreatedAt where Status=Delivered)` → gün |
| **Frequency** | tamamlanmış sipariş sayısı |
| **Monetary** | `SUM(TotalAmount)` tamamlanmış siparişler |
| **Skorlama** | Her metrik müşteri kitlesinde **quintile** (1-5). R için ters (yakın=5). |
| **Segment** | R/F/M kombinasyonu → kural tablosu (örn. R≥4&F≥4 → Loyal; R≤2&F≥3 → AtRisk; R≤2&F≤2 → Sleeping; ilk sipariş <30g → NewCustomer) |
| **Yazma** | `WixiRfmSnapshot` insert (idempotent: UNIQUE CustomerId+SnapshotDate) + `WixiCustomer` denormalize alanları güncelle |

> **Açık soru O-C1:** Segment eşik kuralları sabit mi, per-tenant config mi? **Öneri:** ilk sürüm sabit (kod sabiti); ihtiyaç olursa `WixiRfmRuleSet` per-tenant.
> **Açık soru O-C2:** Churn riski ayrı ML mi, RFM segment türevi mi? **Öneri:** başlangıçta kural-bazlı (AtRisk+Sleeping = churn riski); ML sonraya (M13).

---

### 3. CQRS (`Application/Crm/`)

**Commands**
| Komut | İş |
|---|---|
| `CreateCustomerNoteCommand` / `DeleteCustomerNoteCommand` | Admin notu CRUD |
| `UpdateCustomerConsentCommand` | KVKK izinleri (email/sms/push opt-in) güncelle |
| `SetCustomerBlacklistCommand` | Kara liste işaretle/kaldır (sebep zorunlu) |
| `RecomputeRfmCommand` | Tek müşteri için RFM'i manuel yeniden hesapla (store-admin butonu) |

**Queries**
| Sorgu | İş |
|---|---|
| `GetCustomer360Query` | Tam profil + sipariş özeti + RFM + notlar + loyalty (M03'ten) + iletişim logu |
| `GetCustomersQuery` | Sayfalı liste + **segment/durum filtresi** (mevcut GET'i genişletir) |
| `GetCustomerNotesQuery` | Müşteri notları |
| `GetCustomerSegmentsQuery` | Segment dağılımı (store-admin dashboard) |
| `GetRfmHistoryQuery` | Müşterinin RFM snapshot trendi (cohort) |

---

### 4. Endpoint'ler (`/store-admin/customers` genişletme)

> Mevcut iki endpoint korunur, genişletilir + yenileri eklenir. Route kökü `api/v1/store-admin/customers`.

| Metot | Route | İş | Durum |
|---|---|---|---|
| GET | `/store-admin/customers?segment=&q=&page=` | Sayfalı + segment filtre | 🟡 genişlet |
| GET | `/store-admin/customers/{id}` | 360° görünüm | 🟡 genişlet (Get360) |
| GET | `/store-admin/customers/{id}/notes` | Notlar | ❌ yeni |
| POST | `/store-admin/customers/{id}/notes` | Not ekle | ❌ yeni |
| DELETE | `/store-admin/customers/notes/{noteId}` | Not sil | ❌ yeni |
| PATCH | `/store-admin/customers/{id}/consent` | KVKK izinleri | ❌ yeni |
| PATCH | `/store-admin/customers/{id}/blacklist` | Kara liste | ❌ yeni |
| GET | `/store-admin/customers/segments` | Segment dağılımı | ❌ yeni |
| POST | `/store-admin/customers/{id}/recompute-rfm` | Manuel RFM | ❌ yeni |

Storefront tarafı (`/public/storefront/auth/profile`): KVKK opt-in alanları profil PATCH'ine eklenir (müşteri kendi izinlerini yönetir).

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| `StoreCustomersPage` (store-admin liste) | 🟡 genişlet | Segment rozeti kolonu + segment filtre dropdown (`Select`) + LTV/sipariş kolonları |
| `StoreCustomerDetailPage` (360°) | ❌ yeni | Profil + sipariş geçmişi + RFM rozeti + **not paneli** (Modal ekle/sil) + KVKK toggle'ları (`Switch`) + loyalty (M03) + iletişim logu |
| `StorefrontAccountPage` | 🟡 genişlet | KVKK izin toggle'ları (müşteri self-servis) |

> Zorunlu shared UI (D — CLAUDE.md): `Input/Select/Switch/Modal/Button`, ham input yok. Profil foto `ImageUploadField` (D-02). Not silme onayı `Modal`. Liste `AdvancedDataTable` (DTO `extends Record<string, unknown>`).

---

## Açık Sorular
- **O-C1** Segment eşik kuralları sabit mi / per-tenant config mi? → öneri: sabit başla.
- **O-C2** Churn ML mi, kural-bazlı mı? → öneri: kural-bazlı başla, ML M13'e.
- **O-C3** `WixiCustomer` genişletme mi, ayrı `WixiCustomerProfile` mı? → öneri: genişlet (FK basitliği; misafir müşteride alanlar null kalır).
- RFM job sıklığı: günlük gece mi? Büyük tenant'ta batch'leme gerekir mi?

## Detay Tasarım (TODO)
- [x] Veri modeli + RFM motoru + CQRS + endpoint + frontend tasarımı
- [x] `WixiCustomer` genişletme migration (RFM/KVKK/profil alanları) — `M02CrmCustomerCore` *(2026-07-04)*
- [x] `WixiAddress` fatura alanları migration *(2026-07-04)*
- [x] `WixiCustomerNote` entity + DbSet *(2026-07-04)* — `WixiRfmSnapshot` + `WixiCustomerCommLog` ikinci turda
- [ ] `RfmSnapshotWorker` (BackgroundService) + segment kural tablosu → ClickUp 86ey5p4r2 devamı
- [x] CQRS (Application/Crm/): not, consent, blacklist, 360 *(2026-07-04)* — segment/recompute-rfm ikinci turda
- [x] Endpoint'ler (store-admin/customers genişletme + notes/consent/blacklist) *(2026-07-04)*
- [x] `StoreCustomerDetailPage` (360°) + `StoreCustomersPage` segment filtresi *(2026-07-04)*
- [ ] Storefront profil KVKK toggle (müşteri self-servis)
- [x] Rota: `/tenant/{slug}/customers/:customerId` *(2026-07-04)*
