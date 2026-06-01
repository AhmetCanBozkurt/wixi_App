# Wixi Personal Finance — PRD

**Modül Adı:** `Wixi.Modules.PersonalFinance`  
**Kapsam:** Bireysel kullanıcı + ev/aile ortak bütçe yönetimi (tenant bağımsız)  
**Versiyon:** 1.0  
**Tarih:** 2026-05-23  
**Kaynak Analiz:** WixiBudget v1 (C:/PROJECTS/05_WixiBudget) + WixiFinanceTrack 360 PRD + Partnership PRD  
**Durum:** Planlama — Geliştirme Başlamadı

> **Mimari Not:** Bu modül tenant sistemi ile **hiçbir bağı yoktur**.  
> Veri sahibi `WixiUser` (UserId) veya `WixiHousehold` (HouseholdId) olur.  
> İşletme / mağaza finansı için bkz. [finance-module-prd.md](finance-module-prd.md)

---

## 1. Executive Summary

Wixi platformuna kayıtlı her kullanıcı, mağaza sahibi olsun ya da olmasın, kişisel gelir-gider-yatırım takibini yapabilecek. Bir kullanıcı ayrıca **Household (Ev Grubu)** oluşturarak eşi, çocukları veya oda arkadaşlarıyla ortak bütçe ve harcama takibi yürütebilecek.

Bu modül WixiBudget'te kanıtlanmış veri modelini alır, Wixi'nin Clean Architecture kurallarına uyarlar ve iki temel kullanım senaryosunu tek modülde birleştirir:

| Senaryo | Veri Sahibi | Açıklama |
|---|---|---|
| **Kişisel Finans** | `WixiUser` | Tek kullanıcı, kendi gelir/gider/yatırım takibi |
| **Ev / Aile Bütçesi** | `WixiHousehold` | Birden fazla kullanıcı, ortak havuz, denge hesabı |

---

## 2. Problem Statement

| Sorun | Etki |
|---|---|
| Wixi kullanıcısının kişisel finansını yönetecek aracı yok | Platform sıkışık kalıyor, yalnızca mağaza aracı olarak görülüyor |
| Ev harcamaları (kira, fatura, market) takip edilemiyor | Aile bütçesi kaçıyor, ay sonu sürpriz |
| Taksitli alımlar (telefon, mobilya) unutuluyor | Ödeme kaçırılıyor, stres artıyor |
| Çiftler / oda arkadaşları harcama paylaşımını manuel hesaplıyor | Anlaşmazlık ve zaman kaybı |
| Altın, döviz, hisse birikimi dağınık not / Excel'de | Anlık portföy değeri bilinmiyor |

---

## 3. Goals & Success Metrics

### Primary Goals
1. **Kişisel Finans Eksiksiz** — gelir, gider, taksit, bütçe, yatırım tek ekranda
2. **Ev Grubu (Household)** — aile üyeleri ortak havuzda harcama takibi + denge hesabı
3. **Gerçek Zamanlı Yatırım** — altın, döviz, BIST, kripto anlık kâr/zarar
4. **Akıllı Bildirimler** — taksit vade, bütçe aşımı, aylık özet

### Success Metrics (6 ay)
| KPI | Hedef |
|---|---|
| Kişisel finans aktif kullanıcı oranı | %35+ (kayıtlı kullanıcılar arasında) |
| Household oluşturan kullanıcı | %20+ |
| Aylık transaction girişi (kullanıcı başı) | 15+ |
| Yatırım modülü aktif | %15+ |
| Aylık özet e-posta açılma oranı | %55+ |

---

## 4. Kullanıcı Personaları

| Persona | Profil | Temel Senaryo |
|---|---|---|
| **Bireysel — Zeynep** (26, yazılımcı) | Bekar, kira ödüyor | Aylık bütçe + taksitli telefon takibi |
| **Aile Yöneticisi — Ayşe** (34, evli, 2 çocuk) | Aile harcamalarını takip ediyor | Household bütçesi, eşin harcamaları, okul masrafları |
| **Oda Arkadaşı — Mehmet** (22, öğrenci) | 3 kişilik daire | Kira + fatura paylaşımı, kim ne ödedi |
| **Yatırımcı — Hasan** (45, mağaza sahibi) | Döviz + altın birikimi var | Portföy değeri + kâr/zarar, Wixi'nin tenant Finance'ı yanında kişisel finans |

---

## 5. Feature Requirements

### 5.1 Kişisel Gelir & Gider Takibi

Tenant modülüyle özdeş iş mantığı, fakat `TenantId` yoktur — her kayıt `UserId`'e bağlıdır.

**İşlemler:**
- Gelir veya gider kaydı
- Zorunlu: tutar, tür (Income / Expense), kategori, tarih
- Opsiyonel: açıklama, etiket (tags), bütçe bağlantısı
- Sayfalanmış listeleme, tarih/kategori/tür filtresi, arama

**Entity: `WixiPersonalTransaction`**
```
Id            Guid
UserId        int               (WixiUser FK — her zaman dolu)
HouseholdId   Guid?             (Household havuzuna aitse dolu)
CategoryId    Guid
BudgetId      Guid?
Amount        decimal(18,2)
Description   string(500)
Date          DateTime
Type          TransactionType   (Income | Expense)
Tags          string?           (JSON)
IsInstallment bool
InstallmentPlanId Guid?
SharingType   SharingType?      (Household işleminde: Equal | Proportional | Personal | Custom)
CreatedAt, UpdatedAt
```

---

### 5.2 Taksitli Gider (Installment)

Türkiye kredi kartı taksit alışkanlığı için kritik özellik. Tenant Finance modülüyle aynı mantık.

**Akış:**
1. Kullanıcı taksitli gider seçer → başlangıç tarihi + taksit sayısı (2–120) + toplam tutar
2. Sistem `WixiPersonalInstallmentDetail` kayıtlarını otomatik oluşturur (her aya birer tane)
3. Ödeme yapıldığında `PaidStatus = true`
4. Vade 3 gün kalmışsa e-posta bildirim

**Entities:**

`WixiPersonalInstallmentPlan`
```
Id               Guid
UserId           int
TransactionId    Guid
StartDate        DateTime
TotalCount       int
MonthlyAmount    decimal(18,2)
CreatedAt
```

`WixiPersonalInstallmentDetail`
```
Id                  Guid
InstallmentPlanId   Guid
Month               int
Year                int
DueDate             DateTime
Amount              decimal(18,2)
PaidStatus          bool
PaidAt              DateTime?
```

---

### 5.3 Kişisel Bütçe Yönetimi

- Aylık / haftalık / yıllık dönem bütçesi
- Kategori bazlı alt-bütçe dağılımı
- Aşım eşiği bildirimi: %80 (sarı), %100 (kırmızı)
- Dönem sonunda otomatik yenileme (opsiyonel)

**Entity: `WixiPersonalBudget`**
```
Id            Guid
UserId        int
HouseholdId   Guid?     (household paylaşımlı bütçe ise dolu)
Name          string(100)
StartDate     DateTime
EndDate       DateTime
TotalAmount   decimal(18,2)
SpentAmount   decimal(18,2)   (computed)
Status        BudgetStatus    (Active | Completed | Cancelled)
PeriodType    BudgetPeriodType
AutoRenew     bool
CreatedAt
```

`WixiPersonalBudgetCategory`
```
Id               Guid
BudgetId         Guid
CategoryId       Guid
AllocatedAmount  decimal(18,2)
SpentAmount      decimal(18,2)
```

---

### 5.4 Tekrarlayan İşlemler

- Kira, fatura, abonelik gibi sabit giderler
- Günlük / haftalık / aylık / yıllık periyot
- Background Service her gün kontrol eder, `NextDueDate` geçmişse otomatik transaction oluşturur

**Entity: `WixiPersonalRecurringTransaction`**
```
Id           Guid
UserId       int
HouseholdId  Guid?
CategoryId   Guid
Amount       decimal(18,2)
Description  string(500)
Type         TransactionType
Frequency    RecurrenceFrequency   (Daily | Weekly | Monthly | Yearly)
NextDueDate  DateTime
IsActive     bool
CreatedAt
```

---

### 5.5 Kategoriler

Kullanıcı başına özelleştirilebilir. Sistem seed kategorileri tüm kullanıcılarda ortak.

**Sistem Varsayılan Kategorileri (seed):**

| Kategori | Tür | İkon |
|---|---|---|
| Market & Gıda | Expense | 🛒 |
| Kira | Expense | 🏠 |
| Fatura (Elektrik/Su/Gaz) | Expense | 💡 |
| Ulaşım | Expense | 🚌 |
| Sağlık | Expense | 🏥 |
| Eğitim | Expense | 📚 |
| Eğlence & Restoran | Expense | 🎭 |
| Giyim | Expense | 👕 |
| Taksit Ödemesi | Expense | 💳 |
| Maaş | Income | 💰 |
| Kira Geliri | Income | 🏘️ |
| Serbest Çalışma | Income | 💻 |
| Diğer Gelir | Income | ➕ |

**Entity: `WixiPersonalCategory`**
```
Id         Guid
UserId     int?       (null = sistem varsayılanı)
Name       string(100)
Type       CategoryType   (Income | Expense | Both)
Color      string(7)
Icon       string(50)
IsDefault  bool
IsDeleted  bool
```

---

### 5.6 Household (Ev / Aile Grubu)

WixiBudget Partnership modelinden uyarlanan özellik. Birden fazla kullanıcının ortak havuz oluşturmasını sağlar.

#### 5.6.1 Household Oluşturma & Üye Yönetimi

**Household Türleri:**
- Aile (Family)
- Çift (Couple)
- Oda Arkadaşları (Roommates)
- Proje Grubu (ProjectGroup)
- Diğer

**Üye Rolleri:**

| İşlem | Yönetici (Admin) | Üye (Member) |
|---|---|---|
| Household silme | ✅ | ❌ |
| Üye davet etme (e-posta ile) | ✅ | ❌ |
| Üye çıkarma | ✅ | ❌ |
| Bütçe oluşturma | ✅ | ❌ |
| Bütçe görüntüleme | ✅ | ✅ |
| Harcama ekleme | ✅ | ✅ |
| Harcama görüntüleme | ✅ | ✅ |
| Household'dan ayrılma | ✅ | ✅ |
| Denge görüntüleme | ✅ | ✅ |

**İş Kuralları:**
- Bir kullanıcı maksimum 5 household'a üye olabilir
- Bir kullanıcı maksimum 2 household'ın yöneticisi olabilir
- Household'da en az 1 yönetici olmalı
- Davet e-postası 7 gün geçerli
- Maksimum 10 üye / household

**Entities:**

`WixiHousehold`
```
Id            Guid
Name          string(50)
Description   string(200)?
Type          HouseholdType
CurrencyCode  string(3)       (varsayılan TRY)
Color         string(7)?      (hex, UI için)
CreatedBy     int             (UserId)
CreatedAt, UpdatedAt
IsActive      bool
```

`WixiHouseholdMember`
```
Id            Guid
HouseholdId   Guid
UserId        int
Role          HouseholdRole   (Admin | Member)
JoinedAt      DateTime
IsActive      bool
```

`WixiHouseholdInvitation`
```
Id            Guid
HouseholdId   Guid
InvitedEmail  string
InvitedBy     int             (UserId)
Token         string          (GUID, e-postada link)
ExpiresAt     DateTime        (7 gün)
AcceptedAt    DateTime?
IsUsed        bool
```

#### 5.6.2 Ortak Harcama & Paylaşım

Household üyeleri harcama girerken paylaşım türü seçer:

| SharingType | Açıklama | Örnek |
|---|---|---|
| Equal | Tüm üyeler arasında eşit | 300₺ ÷ 3 kişi = 100₺/kişi |
| Proportional | Belirtilen oranlar | %50 / %30 / %20 |
| Personal | Sadece girenin harcaması | Kişisel alışveriş |
| Custom | Seçilen üyeler + özel tutar | 2 kişi 150₺'şer |

`WixiPersonalTransactionShare`
```
Id              Guid
TransactionId   Guid
UserId          int
ShareAmount     decimal(18,2)
SharePercentage decimal(5,2)
```

#### 5.6.3 Otomatik Denge Hesabı (Balance Engine)

Kim kime ne kadar borçlu? Sistemi her işlemden sonra yeniden hesaplar.

**Algoritma:**
```
Örnek: 3 kişilik Household (Ayşe, Mehmet, Ali)

İşlemler:
  Ayşe market: 900₺ (eşit paylaşım) → her biri 300₺ borçlu
  Mehmet fatura: 450₺ (eşit) → her biri 150₺ borçlu
  Ali kira: 1500₺ (eşit) → her biri 500₺ borçlu

Net Durum:
  Ayşe: ödediği 900₺, payı 300+150+500=950₺ → -50₺ borçlu
  Mehmet: ödediği 450₺, payı 950₺ → -500₺ borçlu
  Ali: ödediği 1500₺, payı 950₺ → +550₺ alacaklı

Optimal Ödeme Önerisi:
  Mehmet → Ali: 500₺
  Ayşe  → Ali: 50₺
```

`WixiHouseholdBalance` (materialized view / computed table)
```
Id            Guid
HouseholdId   Guid
UserId        int
NetBalance    decimal(18,2)    (+ = alacaklı, - = borçlu)
UpdatedAt     DateTime
```

`WixiHouseholdPayment` (ödeme kaydı)
```
Id            Guid
HouseholdId   Guid
PayerUserId   int
PayeeUserId   int
Amount        decimal(18,2)
Note          string(200)?
PaidAt        DateTime
ConfirmedBy   int?            (alacaklının onayı)
ConfirmedAt   DateTime?
```

---

### 5.7 Yatırım Takibi (Kişisel Portföy)

Tenant Finance modülüyle aynı yatırım mantığı, `UserId`'e bağlı.

**Desteklenen Varlıklar:**

| AssetType | Örnekler | Fiyat API |
|---|---|---|
| Gold | Gram altın, çeyrek | TCMB / XAU |
| Currency | USD, EUR, GBP | TCMB EVDS |
| Stock | THYAO.IS, ISCTR.IS | Finnhub |
| Crypto | BTC, ETH | CoinGecko |
| Fund | Yatırım fonu (ISIN) | TEFAS |

`WixiPersonalInvestment`
```
Id             Guid
UserId         int
AssetType      AssetType
AssetCode      string(20)
AssetName      string(100)
Quantity       decimal(18,8)
PurchasePrice  decimal(18,4)
PurchaseDate   DateTime
Notes          string(500)?
CreatedAt
```

`WixiInvestmentValueCache` — tenant Finance modülüyle paylaşımlı (assetCode bazlı, tenant-bağımsız)

**Hesaplama:**
```
CurrentValue   = Quantity × CurrentPrice
ProfitLoss     = CurrentValue - (Quantity × PurchasePrice)
ProfitLossPct  = ProfitLoss / (Quantity × PurchasePrice) × 100
```

---

### 5.8 Raporlama

**Kişisel Dashboard:**
```
┌─────────────────────────────────────────┐
│ Mayıs 2026 Özet                        │
│  Gelir:   ₺28.500   Gider:  ₺19.200   │
│  Bakiye:  ₺9.300    Bütçe:  %68 dolu  │
├─────────────────────────────────────────┤
│ Portföy:  ₺45.800 (+%3.1 bu ay)       │
│ Taksitler: 2 adet — ₺1.400 bu ay      │
└─────────────────────────────────────────┘
```

**Household Dashboard:**
```
┌─────────────────────────────────────────┐
│ "Bozkurt Ailesi" — Mayıs 2026          │
│  Toplam Harcama: ₺12.400              │
│  Bütçe: ₺15.000 (%82 dolu)            │
├─────────────────────────────────────────┤
│ Denge Durumu:                          │
│  Ayşe:   +₺350  (alacaklı)            │
│  Mehmet: -₺200  (borçlu)              │
│  Ali:    -₺150  (borçlu)              │
└─────────────────────────────────────────┘
```

**Rapor Türleri:**

| Rapor | Periyot | Format |
|---|---|---|
| Gelir-Gider Özeti | Aylık / Yıllık | Bar chart + tablo |
| Kategori Dağılımı | Aylık | Pie chart |
| Bütçe Durumu | Dönemsel | Progress bars |
| Taksit Takvimi | 6 aylık | Timeline |
| Portföy Performansı | Anlık / Aylık | Line chart |
| Household Denge Raporu | Anlık | Tablo |
| Nakit Akış Tahmini | Gelecek 3 ay | Tahminsel chart |

---

### 5.9 Bildirimler

Wixi `IMailQueue` altyapısı kullanılır.

| Tetikleyici | Kanal | Şablon |
|---|---|---|
| Taksit vadesi 3 gün kaldı | E-posta | `personal-installment-reminder.html` |
| Bütçe %80 doldu | E-posta | `personal-budget-warning.html` |
| Bütçe %100 aşıldı | E-posta | `personal-budget-exceeded.html` |
| Household harcama eklendi (üyelere) | E-posta | `household-transaction-added.html` |
| Household denge güncellendi | E-posta | `household-balance-updated.html` |
| Household davet | E-posta | `household-invitation.html` |
| Yatırım ±%5 değişim | E-posta | `personal-investment-alert.html` |
| Aylık özet (her ayın 1'i) | E-posta | `personal-monthly-summary.html` |

---

## 6. Technical Architecture

### 6.1 Modül Yapısı

```
src/backend/Wixi.Modules.PersonalFinance/
├── Application/
│   ├── Transactions/
│   │   ├── Commands/ (Create, Update, Delete)
│   │   ├── Queries/ (GetAll, GetById, GetByDateRange, GetTotal)
│   │   └── Dto/
│   ├── Budgets/
│   │   ├── Commands/ (Create, Update, Cancel)
│   │   ├── Queries/ (GetBudgets, GetBudgetSummary)
│   │   └── Dto/
│   ├── Installments/
│   │   ├── Commands/ (CreatePlan, MarkPaid)
│   │   ├── Queries/ (GetUpcoming, GetCalendar)
│   │   └── Dto/
│   ├── Categories/
│   ├── RecurringTransactions/
│   ├── Household/
│   │   ├── Commands/
│   │   │   ├── CreateHousehold/
│   │   │   ├── InviteMember/
│   │   │   ├── AcceptInvitation/
│   │   │   ├── RemoveMember/
│   │   │   ├── AddHouseholdTransaction/
│   │   │   ├── RecordPayment/
│   │   │   └── ConfirmPayment/
│   │   ├── Queries/
│   │   │   ├── GetHouseholds/
│   │   │   ├── GetHouseholdDetail/
│   │   │   ├── GetHouseholdBalance/
│   │   │   ├── GetHouseholdTransactions/
│   │   │   └── GetOptimalPayments/
│   │   └── Dto/
│   ├── Investments/
│   │   ├── Commands/ (Add, Remove)
│   │   ├── Queries/ (GetPortfolio, GetPerformance)
│   │   └── Dto/
│   └── Reports/
│       ├── Queries/ (MonthlySummary, CategoryBreakdown, CashFlow)
│       └── Dto/
├── Domain/
│   └── Entities/
│       ├── WixiPersonalTransaction.cs
│       ├── WixiPersonalTransactionShare.cs
│       ├── WixiPersonalCategory.cs
│       ├── WixiPersonalBudget.cs
│       ├── WixiPersonalBudgetCategory.cs
│       ├── WixiPersonalInstallmentPlan.cs
│       ├── WixiPersonalInstallmentDetail.cs
│       ├── WixiPersonalRecurringTransaction.cs
│       ├── WixiPersonalInvestment.cs
│       ├── WixiHousehold.cs
│       ├── WixiHouseholdMember.cs
│       ├── WixiHouseholdInvitation.cs
│       ├── WixiHouseholdBalance.cs
│       └── WixiHouseholdPayment.cs
├── Infrastructure/
│   ├── Data/
│   │   ├── WixiPersonalFinanceDbContext.cs
│   │   ├── WixiPersonalFinanceDbContextFactory.cs
│   │   └── Migrations/
│   └── BackgroundServices/
│       ├── PersonalRecurringTransactionService.cs
│       ├── PersonalInstallmentReminderService.cs
│       └── HouseholdBalanceRecomputeService.cs
└── PersonalFinanceModuleExtensions.cs
```

### 6.2 Controller Yapısı

```
Wixi.API/Controllers/PersonalFinance/
├── PersonalTransactionsController.cs
├── PersonalBudgetsController.cs
├── PersonalInstallmentsController.cs
├── PersonalCategoriesController.cs
├── PersonalRecurringController.cs
├── PersonalInvestmentsController.cs
├── PersonalReportsController.cs
├── HouseholdsController.cs
└── HouseholdTransactionsController.cs
```

Namespace: `Wixi.API.Controllers.PersonalFinance`  
Route base: `/api/v1/me/finance/` (kişisel) ve `/api/v1/households/` (household)

### 6.3 API Uç Noktaları

```
# Kişisel İşlemler
GET    /api/v1/me/finance/transactions?page=&type=&categoryId=&from=&to=
POST   /api/v1/me/finance/transactions
GET    /api/v1/me/finance/transactions/{id}
PUT    /api/v1/me/finance/transactions/{id}
DELETE /api/v1/me/finance/transactions/{id}
GET    /api/v1/me/finance/transactions/total?type=Expense&from=&to=

# Bütçeler
GET    /api/v1/me/finance/budgets
POST   /api/v1/me/finance/budgets
GET    /api/v1/me/finance/budgets/{id}/summary
PUT    /api/v1/me/finance/budgets/{id}
DELETE /api/v1/me/finance/budgets/{id}

# Taksitler
POST   /api/v1/me/finance/installments
GET    /api/v1/me/finance/installments/upcoming
GET    /api/v1/me/finance/installments/calendar
PUT    /api/v1/me/finance/installments/{detailId}/pay

# Kategoriler
GET    /api/v1/me/finance/categories
POST   /api/v1/me/finance/categories
PUT    /api/v1/me/finance/categories/{id}
DELETE /api/v1/me/finance/categories/{id}

# Tekrarlayan
GET    /api/v1/me/finance/recurring
POST   /api/v1/me/finance/recurring
PUT    /api/v1/me/finance/recurring/{id}
DELETE /api/v1/me/finance/recurring/{id}

# Yatırımlar
GET    /api/v1/me/finance/investments
POST   /api/v1/me/finance/investments
DELETE /api/v1/me/finance/investments/{id}
GET    /api/v1/me/finance/investments/portfolio

# Raporlar
GET    /api/v1/me/finance/reports/monthly-summary?year=&month=
GET    /api/v1/me/finance/reports/category-breakdown?from=&to=
GET    /api/v1/me/finance/reports/cashflow-forecast?months=3
GET    /api/v1/me/finance/reports/export?format=pdf&from=&to=

# Household — Grup Yönetimi
GET    /api/v1/households
POST   /api/v1/households
GET    /api/v1/households/{id}
PUT    /api/v1/households/{id}
DELETE /api/v1/households/{id}

POST   /api/v1/households/{id}/invite         (üye davet)
POST   /api/v1/households/invitations/{token}/accept
DELETE /api/v1/households/{id}/members/{userId}

# Household — İşlem & Denge
GET    /api/v1/households/{id}/transactions
POST   /api/v1/households/{id}/transactions
GET    /api/v1/households/{id}/balance        (kim kime ne kadar)
GET    /api/v1/households/{id}/balance/optimal (önerilen ödeme planı)
POST   /api/v1/households/{id}/payments       (ödeme kaydı)
PUT    /api/v1/households/{id}/payments/{paymentId}/confirm

# Household — Bütçe
GET    /api/v1/households/{id}/budgets
POST   /api/v1/households/{id}/budgets
GET    /api/v1/households/{id}/budgets/{budgetId}/summary
```

### 6.4 Kullanıcı İzolasyonu

- Her sorgu `UserId = currentUser.Id` filtresi içerir (JWT'den)
- Household sorgularında kullanıcının o household'ın üyesi olup olmadığı kontrol edilir
- `WixiPersonalFinanceDbContext.SaveChangesAsync` override'ı `UserId` otomatik doldurur
- Başka kullanıcının verisine erişim → 403 Forbidden

### 6.5 Denge Hesaplama Servisi

`HouseholdBalanceRecomputeService` her transaction ekleme/silmede tetiklenir (MediatR domain event):

```csharp
// Simplified balance algorithm
public class BalanceEngine
{
    public IReadOnlyList<OptimalPayment> ComputeOptimal(
        IReadOnlyList<MemberBalance> balances)
    {
        var creditors = balances.Where(b => b.NetBalance > 0).OrderByDescending(b => b.NetBalance).ToList();
        var debtors   = balances.Where(b => b.NetBalance < 0).OrderBy(b => b.NetBalance).ToList();
        var payments  = new List<OptimalPayment>();

        // Greedy settlement — O(n) typical case
        while (creditors.Any() && debtors.Any())
        {
            var creditor = creditors[0];
            var debtor   = debtors[0];
            var amount   = Math.Min(creditor.NetBalance, Math.Abs(debtor.NetBalance));

            payments.Add(new OptimalPayment(debtor.UserId, creditor.UserId, amount));

            creditor.NetBalance -= amount;
            debtor.NetBalance   += amount;

            if (creditor.NetBalance == 0) creditors.RemoveAt(0);
            if (debtor.NetBalance   == 0) debtors.RemoveAt(0);
        }

        return payments;
    }
}
```

---

## 7. Frontend Architecture

### 7.1 Yeni Route Alanı — `/my-finance/*`

Kişisel finans, mevcut `/admin/*` veya `/store-admin/*` altına **girmez**. Tüm oturum açmış kullanıcılara açık yeni bir rota alanıdır.

```
App.tsx rotaları:
  /my-finance                    → PersonalFinanceDashboardPage
  /my-finance/transactions       → TransactionsPage
  /my-finance/budgets            → BudgetsPage
  /my-finance/installments       → InstallmentsPage
  /my-finance/investments        → InvestmentsPage
  /my-finance/reports            → ReportsPage
  /households                    → HouseholdListPage
  /households/:id                → HouseholdDetailPage
  /households/:id/transactions   → HouseholdTransactionsPage
  /households/:id/balance        → HouseholdBalancePage
  /households/invite/:token      → HouseholdInviteAcceptPage
```

Tüm rotalar `<AuthGuard>` içinde — giriş yapmış her kullanıcı erişebilir.

### 7.2 Sayfa Yapısı (FSD)

```
src/frontend/src/pages/
├── my-finance/
│   ├── PersonalFinanceDashboardPage/
│   │   ├── index.ts
│   │   ├── PersonalFinanceDashboardPage.tsx
│   │   ├── PersonalFinanceDashboardPage.module.css
│   │   └── components/
│   │       ├── BalanceSummaryCard/
│   │       ├── BudgetProgressCard/
│   │       ├── UpcomingInstallmentsCard/
│   │       └── PortfolioSummaryCard/
│   ├── TransactionsPage/
│   ├── BudgetsPage/
│   ├── InstallmentsPage/
│   ├── InvestmentsPage/
│   └── ReportsPage/
└── households/
    ├── HouseholdListPage/
    ├── HouseholdDetailPage/
    │   └── components/
    │       ├── MemberList/
    │       ├── BalanceSummary/
    │       └── OptimalPaymentCard/
    ├── HouseholdTransactionsPage/
    ├── HouseholdBalancePage/
    └── HouseholdInviteAcceptPage/
```

### 7.3 Feature Katmanı

```
src/frontend/src/features/
└── PersonalFinance/
    ├── hooks/
    │   ├── usePersonalTransactions.ts
    │   ├── usePersonalBudgets.ts
    │   ├── usePersonalInstallments.ts
    │   ├── usePersonalInvestments.ts
    │   ├── useHousehold.ts
    │   ├── useHouseholdBalance.ts
    │   └── useMarketData.ts
    ├── store/
    │   └── personalFinanceStore.ts   (Zustand)
    └── index.ts
```

### 7.4 Navigation

`Sidebar` bileşenine yeni menü grubu eklenir:

```
── Kişisel Finans  ──────────────
   📊 Dashboard
   💸 İşlemler
   🎯 Bütçeler
   💳 Taksitler
   📈 Yatırımlar
   📄 Raporlar
── Ev Gruplarım  ────────────────
   🏠 Bozkurt Ailesi
   🏠 Grup Oluştur
```

---

## 8. Integration Points

| Wixi Bileşeni | PersonalFinance Kullanımı |
|---|---|
| `WixiUser` (Identity) | Her kayıt `UserId`'e bağlı — JWT'den alınır |
| `IMailQueue` | Taksit, bütçe, denge, davet bildirimleri |
| `WixiInvestmentValueCache` | Tenant Finance modülüyle ortak — assetCode bazlı |
| Audit Log | Household işlemleri (üye ekleme/çıkarma, büyük ödemeler) loglanır |
| Subscription Plans | Household ve yatırım özellikleri ileride premium'a kilitlenebilir |
| Localization (`tr-TR`) | Tüm UI metinleri lokalizasyon altyapısından gelir |

---

## 9. Implementation Roadmap

### Sprint 3 — 2026-06-08
**Backend Temel (Kişisel Finans)**
- [ ] `Wixi.Modules.PersonalFinance` proje iskeleti
- [ ] Tüm entity'ler + migration
- [ ] Seed data: varsayılan kategoriler
- [ ] Transaction CRUD + filtreleme + toplam
- [ ] Budget CRUD + SpentAmount hesaplama
- [ ] Category CRUD

**Frontend Temel**
- [ ] `/my-finance/*` rota alanı ve `AuthGuard` entegrasyonu
- [ ] Navigation sidebar grubu
- [ ] PersonalFinanceDashboardPage (skeleton)
- [ ] TransactionsPage — listeleme + CRUD modal

### Sprint 4 — 2026-06-15
**Taksit + Tekrarlayan + Household Core**
- [ ] InstallmentPlan CRUD + otomatik detail oluşturma
- [ ] RecurringTransaction + Background Service
- [ ] Household CRUD + üye davet sistemi (e-posta ile)
- [ ] HouseholdTransaction + SharingType hesabı
- [ ] BalanceEngine implementasyonu + OptimalPayment
- [ ] InstallmentsPage + BudgetsPage frontend
- [ ] HouseholdDetailPage + HouseholdBalancePage

### Sprint 5 — 2026-06-22
**Yatırım + Raporlar + Bildirimler**
- [ ] WixiPersonalInvestment CRUD
- [ ] Market data servisleri (TCMB, Finnhub, CoinGecko) — Tenant Finance ile paylaşım
- [ ] InvestmentsPage — portföy görünümü + kâr/zarar
- [ ] ReportsPage — aylık özet chart, kategori pie chart
- [ ] Tüm bildirim şablonları + Background Service'lere entegrasyon
- [ ] Household davet e-postası + `HouseholdInviteAcceptPage`
- [ ] HouseholdPayment (ödeme kayıt + onay)

### Sprint 5+ (Backlog)
- PDF / Excel export
- Nakit akış tahmini (CashFlowForecast)
- Household yatırım portföyü (WixiBudget Partnership Investment modeli)
- Harcama onay sistemi (Household'da belirli limit üstü onay gerekir)
- Household içi mesajlaşma / yorum (harcama üzerine)

---

## 10. Güvenlik & Gizlilik

- Her endpoint `[Authorize]` — giriş zorunlu
- Household erişim kontrolü: istek sahibi household'ın aktif üyesi olmalı
- Household admin işlemleri (silme, üye çıkarma) admin rolü kontrolü
- Davet token'ı tek kullanımlık, 7 gün TTL, GUID
- Finansal veriler kullanıcıya özel — başka kullanıcı göremez
- Household verileri yalnızca üyelerine görünür

---

## 11. Open Questions

| Soru | Karar Gerekli |
|---|---|
| `/my-finance/*` rotası mobil app'te de olacak mı (React Native)? | Ürün kararı |
| Household üyesi olmayan kullanıcı ekleme — sadece Wixi kaydı zorunlu mu? | İş kuralı |
| Household bütçe kimin para biriminden hesaplanır? Yöneticinin mi? | UX kararı |
| Investment cache Tenant Finance modülüyle fiziksel tablo paylaşımı — ayrı DB'ler sorun yaratır mı? | Mimari karar |
| Household harcama onay limiti — konfigürasyon mı, sabit mi? | Ürün kararı |
| Kişisel finans verileri kullanıcı hesabı silindiğinde ne olur? | KVKK / veri politikası |

---

**Sonraki Adım:** Sprint 3 başında `Wixi.Modules.PersonalFinance` iskeleti + entity migration. Open Questions'ları paydaşlarla kapatmak.

**Son Güncelleme:** 2026-05-23  
**Hazırlayan:** Ahmet Can Bozkurt (WixiBudget + WixiFinanceTrack 360 + Partnership PRD kaynak alınarak)
