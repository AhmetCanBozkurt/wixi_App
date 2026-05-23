# Wixi Finance Module — PRD (Tenant / İşletme)

**Modül Adı:** `Wixi.Modules.Finance`  
**Kapsam:** Tenant (mağaza/işletme) finansal takibi — kişisel kullanım bu modülün dışındadır  
**Versiyon:** 1.0  
**Tarih:** 2026-05-23  
**Kaynak Analiz:** WixiBudget v1 (C:/PROJECTS/05_WixiBudget) + WixiFinanceTrack 360 PRD  
**Durum:** Planlama — Geliştirme Başlamadı

> **Mimari Not:** Kişisel / ev ekonomisi yönetimi tamamen ayrı `Wixi.Modules.PersonalFinance` modülünde ele alınır.  
> Bkz. [personal-finance-prd.md](personal-finance-prd.md)

---

## 1. Executive Summary

Finance modülü, Wixi platformundaki her tenant'ın (mağaza sahibi / işletme) gelir-gider, bütçe ve yatırımlarını tek bir ekrandan yönetmesini sağlayan tam entegre bir finansal kontrol katmanıdır.

WixiBudget projesinde kanıtlanmış olan veri modeli ve iş mantığı (Transaction, Budget, Category, RecurringTransaction, InstallmentPlan, Investment) Wixi'nin modüler monoliti içine `Wixi.Modules.Finance` olarak taşınır. Partnership (ortaklaşa bütçe) özelliği ise ayrı bir sonraki fazda ele alınır.

**Temel değer önerisi:**
- Tenant başına eksiksiz finansal tablo (gelir / gider / bakiye)
- Taksitli gider otomasyonu (aylık taksit dağıtımı + ödeme hatırlatması)
- Kategori bazlı bütçe kontrolü
- Altın, döviz ve hisse entegrasyonu ile yatırım portföyü
- Aylık ve yıllık raporlar + e-posta bildirimleri

---

## 2. Problem Statement

Wixi'de mağaza sahipleri e-ticaret işlemlerini (sipariş, ödeme, kargo) yönetebiliyor; ancak işletme finansını takip edecekleri bir araç yok. Şu an yaşanan sorunlar:

| Sorun | Etki |
|---|---|
| Gelir-gider manüel Excel ile takip ediliyor | Hata riski yüksek, zaman kaybı |
| Taksitli harcamalar takip edilemiyor | Ödemeler kaçırılıyor |
| Bütçe limiti aşımları fark edilmiyor | Nakit akışı bozuluyor |
| Yatırım portföyü (altın, döviz) ayrı araçlarla takip ediliyor | Bütünsel tablo yok |
| Dönemsel rapor yok | Yönetimsel karar güçleşiyor |

---

## 3. Goals & Success Metrics

### Primary Goals
1. Tenant başına tam finansal tablo — gelir, gider, bakiye, taksit
2. Bütçe kontrolü — kategori bazlı limit ve aşım uyarısı
3. Yatırım portföyü — anlık kâr/zarar ile gerçek zamanlı değerleme
4. Dönemsel raporlar — aylık özet e-postası + PDF export

### Success Metrics (6 ay sonra)
| KPI | Hedef |
|---|---|
| Aktif tenant kullanımı | %40+ |
| Aylık transaction girişi (tenant başı) | 20+ |
| Bütçe oluşturan tenant | %30+ |
| Yatırım modülü aktif kullanım | %20+ |
| Aylık rapor e-posta açılma oranı | %60+ |

---

## 4. Hedef Kullanıcılar

| Persona | Profil | Temel İhtiyaç |
|---|---|---|
| **Mağaza Sahibi — Mehmet** (35, e-ticaret) | Tek başına yönetiyor | Aylık kâr-zarar tablosu, taksit takibi |
| **Muhasebeci — Ayşe** (28, KOBİ) | Tenant admin yetkisi var | Kategori bazlı raporlar, Excel/PDF export |
| **Yatırımcı Sahip — Can** (42, çoklu mağaza) | Döviz/altın birikimi var | Portföy kâr/zarar, anlık kur |

---

## 5. Feature Requirements

### 5.1 Gelir & Gider Takibi (Transaction Management)

**Temel İşlemler:**
- Gelir veya gider kaydı oluşturma
- Zorunlu alanlar: tutar, tür (Income/Expense), kategori, tarih
- Opsiyonel: açıklama, etiket (tags), bütçe bağlantısı
- Sayfalanmış listeleme (sayfa başı 20 kayıt, varsayılan)
- Filtreleme: tarih aralığı, kategori, tür
- Arama: açıklama veya etikete göre
- Tür bazlı toplam hesaplama (GetTotalAmount)

**İş Kuralları:**
- Tutar 0'dan büyük olmalı
- Geçmiş tarihli kayıt — sınırsız
- Gelecek tarihli kayıt — maksimum 7 gün
- Kayıt silindiğinde bağlı bütçe harcaması geri alınır

**Varlık: `WixiFinanceTransaction`**

```
Id             Guid
TenantId       string          (X-Tenant-Slug'dan)
CategoryId     Guid
BudgetId       Guid?
Amount         decimal(18,2)
Description    string(500)
Date           DateTime
Type           TransactionType  (Income | Expense)
Tags           string?          (JSON array)
IsInstallment  bool
InstallmentPlanId Guid?
CreatedAt, UpdatedAt
```

---

### 5.2 Taksitli Gider (Installment Management)

WixiFinanceTrack 360'tan alınan özellik. Türkiye'deki kredi kartı taksit kültürü için kritik.

**Nasıl Çalışır:**
1. Kullanıcı "taksitli" gider seçer
2. Başlangıç tarihi, taksit sayısı (2–120) ve toplam tutarı girer
3. Sistem her aya otomatik `InstallmentDetail` kaydı oluşturur
4. Her ay ödeme yapıldığında `PaidStatus = true` işaretlenir
5. Gelecek ay taksit yaklaşınca bildirim tetiklenir

**Varlıklar:**

`WixiInstallmentPlan`
```
Id               Guid
TenantId         string
TransactionId    Guid        (ilk ana gider kaydı)
StartDate        DateTime
TotalCount       int
MonthlyAmount    decimal(18,2)
RemainingCount   int         (computed)
CreatedAt
```

`WixiInstallmentDetail`
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

**İş Kuralları:**
- Taksit oluşturulduğunda tüm ay detayları toplu insert edilir
- Taksit sayısı 2–120 arası
- Taksit silindiğinde tüm detaylar ve ana işlem silinir
- Ödeme durumu değişikliği audit log'a düşer

---

### 5.3 Bütçe Yönetimi (Budget Management)

**Bütçe Oluşturma:**
- Ad, dönem (aylık/haftalık/yıllık), başlangıç-bitiş tarihi, toplam tutar
- Kategori bazlı alt-bütçe dağılımı (opsiyonel)
- Otomatik yenileme seçeneği

**Bütçe Takibi:**
- Gerçek zamanlı harcama yüzdesi (`SpentAmount / TotalAmount`)
- Kategori bazlı kalan bakiye
- Aşım uyarısı eşiği: %80 (sarı), %90 (turuncu), %100 (kırmızı)
- Aylık/dönemsel bütçe raporları
- Excel/PDF export

**İş Kuralları:**
- Aktif bütçe döneminde üst üste bütçe açılmaz (aynı kategori)
- Kategori bütçeleri toplamı genel bütçeyi geçemez
- `BudgetStatus`: Active | Completed | Cancelled

**Varlık: `WixiFinanceBudget`**
```
Id            Guid
TenantId      string
Name          string(100)
StartDate     DateTime
EndDate       DateTime
TotalAmount   decimal(18,2)
SpentAmount   decimal(18,2)   (computed, transactions'dan)
Status        BudgetStatus
PeriodType    BudgetPeriodType  (Monthly | Weekly | Yearly)
AutoRenew     bool
CreatedAt
```

`WixiFinanceBudgetCategory`
```
Id               Guid
BudgetId         Guid
CategoryId       Guid
AllocatedAmount  decimal(18,2)
SpentAmount      decimal(18,2)
```

---

### 5.4 Kategori Yönetimi

- Sistem varsayılan kategorileri (seed data): Market, Fatura, Kira, Maaş, Satış Geliri, Kargo, Reklam, vb.
- Tenant kendi kategorisini oluşturabilir
- Her kategorinin rengi ve ikonu var (UI'da kullanmak için)
- Kategori tipi: Income | Expense | Both

**Varlık: `WixiFinanceCategory`**
```
Id         Guid
TenantId   string?    (null = sistem varsayılanı)
Name       string(100)
Type       CategoryType
Color      string(7)   (hex)
Icon       string(50)
IsDefault  bool
IsDeleted  bool
```

---

### 5.5 Tekrarlayan İşlemler (Recurring Transactions)

- Günlük / haftalık / aylık / yıllık periyot
- Aktif iken her döneme otomatik transaction oluşturur (Background Service)
- İptal edilene kadar devam eder

**Varlık: `WixiRecurringTransaction`**
```
Id              Guid
TenantId        string
CategoryId      Guid
Amount          decimal(18,2)
Description     string(500)
Type            TransactionType
Frequency       RecurrenceFrequency  (Daily | Weekly | Monthly | Yearly)
NextDueDate     DateTime
IsActive        bool
CreatedAt
```

---

### 5.6 Yatırım Takip Modülü (Investment Tracking)

WixiBudget Partnership Investment + WixiFinanceTrack 360 kaynaklarından birleştirilen özellik.

**Desteklenen Varlık Türleri:**

| AssetType | Örnekler | Fiyat Kaynağı |
|---|---|---|
| Gold | Gram altın, çeyrek altın | TCMB / altinyatirim.com |
| Currency | USD, EUR, GBP, CHF | TCMB EVDS API |
| Stock (BIST) | THYAO.IS, ISCTR.IS | Finnhub veya Yahoo Finance |
| Crypto | BTC, ETH | CoinGecko API |
| Fund | Yatırım fonları (ISIN kodu) | Takasbank / TEFAS API |

**Yatırım Kaydı Oluşturma:**
- Alım tarihi, varlık türü, varlık kodu, miktar, alım fiyatı, açıklama
- Sistem anlık fiyatı çeker, kâr/zarar hesaplar

**Portföy Görünümü:**
- Toplam portföy değeri (TL bazında)
- Varlık bazlı dağılım (pie chart)
- Günlük / aylık getiri yüzdesi
- Kâr/zarar renk kodlaması (yeşil/kırmızı)

**Gerçek Zamanlı Fiyat Güncelleme:**
- `WixiInvestmentValueCache` tablosu: assetCode + date + price + source
- Background Service her 15 dakikada bir güncel fiyatları çeker (piyasa saatlerinde)
- Piyasa dışı saatlerde son bilinen değer kullanılır

**Varlıklar:**

`WixiInvestment`
```
Id             Guid
TenantId       string
AssetType      AssetType  (Gold | Currency | Stock | Crypto | Fund)
AssetCode      string(20)  (XAU, USD, THYAO.IS, BTC, vb.)
AssetName      string(100)
Quantity       decimal(18,8)
PurchasePrice  decimal(18,4)
PurchaseDate   DateTime
Notes          string(500)?
CreatedAt
```

`WixiInvestmentValueCache`
```
Id         Guid
AssetCode  string(20)
Date       DateTime
Price      decimal(18,4)
Source     string(50)
```

**Hesaplama (runtime):**
```
CurrentValue   = Quantity × CurrentPrice
PurchaseCost   = Quantity × PurchasePrice
ProfitLoss     = CurrentValue - PurchaseCost
ProfitLossPct  = (ProfitLoss / PurchaseCost) × 100
```

---

### 5.7 Raporlama & Analitik

**Dashboard (Ana Ekran):**
```
┌─────────────────────────────────────────┐
│ Bu Ay Özet                             │
│  Gelir:   ₺45.200    Gider:  ₺32.800  │
│  Bakiye:  ₺12.400    Bütçe:  %73 dolu │
├─────────────────────────────────────────┤
│ Portföy Değeri: ₺128.500 (+%4.2)       │
│ Bekleyen Taksit: 3 adet — ₺2.750      │
└─────────────────────────────────────────┘
```

**Rapor Türleri:**

| Rapor | Periyot | Format |
|---|---|---|
| Gelir-Gider Özeti | Aylık / Yıllık | Tablo + Bar Chart |
| Kategori Bazlı Harcama | Aylık | Pie Chart + Tablo |
| Bütçe Durum Raporu | Dönemsel | Progress bar |
| Taksit Takvimi | 6 aylık | Timeline |
| Yatırım Portföy Raporu | Anlık / Aylık | Line chart + Tablo |
| Nakit Akış Tahmini | Gelecek 3 ay | Tahminsel |

**Export:**
- PDF (sunucu taraflı, Playwright veya wkhtmltopdf)
- Excel (EPPlus kütüphanesi)

---

### 5.8 Bildirim Sistemi

Mevcut Wixi mailing altyapısı (`IMailQueue` → `MailingBackgroundWorker`) kullanılır.

| Tetikleyici | Bildirim Türü | Kanal |
|---|---|---|
| Bütçe %80 doldu | Anlık | E-posta |
| Bütçe %100 doldu (aşıldı) | Anlık | E-posta |
| Taksit vadesi 3 gün kaldı | Günlük kontrol | E-posta |
| Aylık özet | Her ayın 1'i | E-posta |
| Yatırım %5+ değişim | Anlık (cache güncelleme sonrası) | E-posta |

Mail şablonları Scriban ile `WIXI_MAIL_TEMPLATES` altına eklenir:
- `finance-budget-warning.html`
- `finance-installment-reminder.html`
- `finance-monthly-summary.html`
- `finance-investment-alert.html`

---

## 6. Technical Architecture

### 6.1 Modül Yapısı

```
src/backend/Wixi.Modules.Finance/
├── Application/
│   ├── Transactions/
│   │   ├── Commands/
│   │   │   ├── CreateTransaction/
│   │   │   │   ├── CreateTransactionCommand.cs
│   │   │   │   └── CreateTransactionCommandHandler.cs
│   │   │   ├── UpdateTransaction/
│   │   │   └── DeleteTransaction/
│   │   ├── Queries/
│   │   │   ├── GetTransactions/
│   │   │   ├── GetTransactionById/
│   │   │   ├── GetTransactionsByDateRange/
│   │   │   └── GetTotalByType/
│   │   └── Dto/
│   ├── Budgets/
│   │   ├── Commands/ (Create, Update, Cancel)
│   │   ├── Queries/ (GetBudgets, GetBudgetSummary)
│   │   └── Dto/
│   ├── Installments/
│   │   ├── Commands/ (CreateInstallmentPlan, MarkInstallmentPaid)
│   │   ├── Queries/ (GetUpcomingInstallments, GetInstallmentCalendar)
│   │   └── Dto/
│   ├── Categories/
│   ├── RecurringTransactions/
│   ├── Investments/
│   │   ├── Commands/ (AddInvestment, RemoveInvestment)
│   │   ├── Queries/ (GetPortfolio, GetInvestmentPerformance)
│   │   └── Dto/
│   └── Reports/
│       ├── Queries/ (GetMonthlySummary, GetCategoryBreakdown, GetCashFlowForecast)
│       └── Dto/
├── Domain/
│   └── Entities/
│       ├── WixiFinanceTransaction.cs
│       ├── WixiFinanceCategory.cs
│       ├── WixiFinanceBudget.cs
│       ├── WixiFinanceBudgetCategory.cs
│       ├── WixiInstallmentPlan.cs
│       ├── WixiInstallmentDetail.cs
│       ├── WixiRecurringTransaction.cs
│       ├── WixiInvestment.cs
│       └── WixiInvestmentValueCache.cs
├── Infrastructure/
│   ├── Data/
│   │   ├── WixiFinanceDbContext.cs
│   │   ├── WixiFinanceDbContextFactory.cs
│   │   └── Migrations/
│   ├── Services/
│   │   ├── IMarketDataService.cs
│   │   ├── TcmbMarketDataService.cs      ← Altın + Döviz
│   │   ├── FinnhubMarketDataService.cs   ← BIST hisseleri
│   │   └── CoinGeckoMarketDataService.cs ← Kripto
│   └── BackgroundServices/
│       ├── InvestmentPriceUpdaterService.cs   ← 15 dk'da bir cache güncelle
│       ├── RecurringTransactionService.cs     ← Günlük periyodik işlem oluştur
│       └── InstallmentReminderService.cs      ← Vade bildirim kontrolü
└── FinanceModuleExtensions.cs
```

### 6.2 Controller Yapısı

```
Wixi.API/Controllers/Finance/
├── FinanceTransactionsController.cs
├── FinanceBudgetsController.cs
├── FinanceInstallmentsController.cs
├── FinanceCategoriesController.cs
├── FinanceRecurringController.cs
├── FinanceInvestmentsController.cs
└── FinanceReportsController.cs
```

Namespace: `Wixi.API.Controllers.Finance`  
Route base: `/api/v1/finance/`

### 6.3 API Uç Noktaları

```
# Transactions
GET    /api/v1/finance/transactions?page=1&pageSize=20&type=&categoryId=&from=&to=
POST   /api/v1/finance/transactions
GET    /api/v1/finance/transactions/{id}
PUT    /api/v1/finance/transactions/{id}
DELETE /api/v1/finance/transactions/{id}
GET    /api/v1/finance/transactions/total?type=Expense&from=&to=

# Budgets
GET    /api/v1/finance/budgets
POST   /api/v1/finance/budgets
GET    /api/v1/finance/budgets/{id}
PUT    /api/v1/finance/budgets/{id}
DELETE /api/v1/finance/budgets/{id}
GET    /api/v1/finance/budgets/{id}/summary

# Installments
POST   /api/v1/finance/installments          (plan oluştur)
GET    /api/v1/finance/installments/upcoming  (sonraki 3 ay)
GET    /api/v1/finance/installments/calendar  (6 aylık takvim)
PUT    /api/v1/finance/installments/{detailId}/pay

# Categories
GET    /api/v1/finance/categories
POST   /api/v1/finance/categories
PUT    /api/v1/finance/categories/{id}
DELETE /api/v1/finance/categories/{id}

# Recurring Transactions
GET    /api/v1/finance/recurring
POST   /api/v1/finance/recurring
PUT    /api/v1/finance/recurring/{id}
DELETE /api/v1/finance/recurring/{id}

# Investments
GET    /api/v1/finance/investments
POST   /api/v1/finance/investments
GET    /api/v1/finance/investments/{id}
DELETE /api/v1/finance/investments/{id}
GET    /api/v1/finance/investments/portfolio  (tüm portföy özeti)

# Market Data (cache'den okur)
GET    /api/v1/finance/market/gold
GET    /api/v1/finance/market/currency?code=USD
GET    /api/v1/finance/market/stock?symbol=THYAO.IS
GET    /api/v1/finance/market/crypto?code=BTC

# Reports
GET    /api/v1/finance/reports/monthly-summary?year=2026&month=5
GET    /api/v1/finance/reports/yearly-summary?year=2026
GET    /api/v1/finance/reports/category-breakdown?from=&to=
GET    /api/v1/finance/reports/cashflow-forecast?months=3
GET    /api/v1/finance/reports/export?format=pdf&from=&to=
```

### 6.4 Tenant İzolasyonu

- Her sorgu `TenantId` filtresi içerir (mevcut `TenantMiddleware` + `X-Tenant-Slug` header)
- `WixiFinanceDbContext` tenant-aware: `SaveChangesAsync` override'ı ile `TenantId` otomatik set edilir
- Market data cache (`WixiInvestmentValueCache`) tenant-bağımsız paylaşımlı tablo (assetCode bazlı)

### 6.5 Dış API Entegrasyonları

| Sağlayıcı | Veri | URL / Yöntem |
|---|---|---|
| TCMB EVDS | TL/döviz kurları | `https://evds2.tcmb.gov.tr/service/evds/` (API key gerekli) |
| Bigpara / altinyatirim.com | Gram altın fiyatı | RSS veya scraping (fallback: TCMB XAU) |
| Finnhub | BIST hisse fiyatları | `https://finnhub.io/api/v1/quote?symbol=` |
| CoinGecko | Kripto fiyatları | `https://api.coingecko.com/api/v3/simple/price` (ücretsiz plan) |

Tüm dış API anahtarları `appsettings.json` → `Finance:MarketData` section'ına eklenir:
```json
"Finance": {
  "MarketData": {
    "TcmbApiKey": "",
    "FinnhubApiKey": "",
    "PriceUpdateIntervalMinutes": 15
  }
}
```

---

## 7. Frontend Architecture

### 7.1 Sayfa Yapısı (FSD)

```
src/frontend/src/pages/
└── admin/
    └── finance/
        ├── FinanceDashboardPage/
        │   ├── index.ts
        │   ├── FinanceDashboardPage.tsx
        │   ├── FinanceDashboardPage.module.css
        │   └── components/
        │       ├── BalanceSummaryCard/
        │       ├── BudgetProgressWidget/
        │       ├── UpcomingInstallmentsWidget/
        │       └── PortfolioSummaryWidget/
        ├── TransactionsPage/
        │   ├── index.ts
        │   ├── TransactionsPage.tsx
        │   └── components/
        │       ├── TransactionForm/
        │       └── TransactionFilters/
        ├── BudgetsPage/
        ├── InstallmentsPage/
        ├── InvestmentsPage/
        │   └── components/
        │       ├── PortfolioOverview/
        │       ├── AssetCard/
        │       └── AddInvestmentModal/
        └── ReportsPage/
            └── components/
                ├── MonthlyChart/
                ├── CategoryPieChart/
                └── ExportButton/
```

### 7.2 Feature Katmanı

```
src/frontend/src/features/
└── Finance/
    ├── hooks/
    │   ├── useTransactions.ts
    │   ├── useBudgets.ts
    │   ├── useInstallments.ts
    │   ├── useInvestments.ts
    │   └── useMarketData.ts
    ├── store/
    │   └── financeStore.ts    (Zustand)
    └── index.ts
```

### 7.3 Shared UI Kuralları

Tüm formlarda CLAUDE.md'deki hazır bileşenler kullanılır:

| İhtiyaç | Bileşen |
|---|---|
| Tutar girişi | `<Input type="number">` |
| Kategori seçimi | `<Select options={categories}>` |
| İşlem türü | `<Select>` (Income / Expense) |
| Taksit adet | `<Input type="number" min={2} max={120}>` |
| Yatırım varlık tipi | `<Select>` |
| Kaydet / İptal | `<Button variant="primary">` / `<Button variant="ghost">` |
| Silme onayı | `<Modal size="sm">` |
| Grafik | Recharts kütüphanesi (mevcut projede varsa) veya lightweight SVG |

---

## 8. Integration Points (Wixi Platform)

| Wixi Bileşeni | Finance Modülü Kullanımı |
|---|---|
| `WixiUser` (Identity) | Transaction / Budget sahibi — UserId FK |
| `TenantMiddleware` | TenantId her Finance sorgusunda filtre |
| `WixiCoreDbContext` → Currency tablosu | Transaction para birimi doğrulaması |
| `IMailQueue` | Bütçe uyarısı, taksit hatırlatması, aylık özet |
| Audit Log | Kritik işlemler (bütçe oluşturma, yatırım ekleme) loglanır |
| Subscription Plans | Finance modülü Premium plan'a kilitlenebilir (gelecek faz) |
| Admin Panel routes | `/admin/finance/*` rotaları `AuthGuard` içinde |

---

## 9. Implementation Roadmap

Wixi sprint takvimiyle hizalanmış:

### Sprint 3 — 2026-06-08 (high öncelik)
**Backend Foundation**
- [ ] `Wixi.Modules.Finance` proje iskeleti oluştur
- [ ] Entity'ler ve migration (Transaction, Category, Budget, InstallmentPlan/Detail)
- [ ] Seed data: varsayılan kategoriler
- [ ] Transaction CRUD + filtreleme + toplam sorgular
- [ ] Category CRUD
- [ ] Budget CRUD + SpentAmount hesaplama

**Frontend Temel**
- [ ] Finance router kurulumu (`/admin/finance/*`)
- [ ] TransactionsPage — listeleme + CRUD modal
- [ ] BudgetsPage — oluşturma + ilerleme çubuğu

### Sprint 4 — 2026-06-15 (normal)
**Gelişmiş Özellikler**
- [ ] InstallmentPlan CRUD + InstallmentDetail otomasyonu
- [ ] RecurringTransaction + Background Service
- [ ] InstallmentReminderService (mailing entegrasyonu)
- [ ] Bütçe aşım uyarısı maili (%80 / %100)
- [ ] InstallmentsPage (takvim görünümü)
- [ ] ReportsPage — aylık özet + kategori pie chart

### Sprint 5 — 2026-06-22 (normal)
**Yatırım Modülü**
- [ ] WixiInvestment entity + migration
- [ ] WixiInvestmentValueCache + IMarketDataService
- [ ] TcmbMarketDataService (döviz + altın)
- [ ] FinnhubMarketDataService (BIST)
- [ ] CoinGeckoMarketDataService (kripto)
- [ ] InvestmentPriceUpdaterService (Background Service, 15 dk)
- [ ] InvestmentsPage — portföy + kâr/zarar görünümü
- [ ] Yatırım uyarı maili (%5+ değişim)

### Sprint 5+ (Backlog)
- PDF / Excel export (EPPlus + Playwright)
- Nakit akış tahmini (CashFlowForecast)
- Partnership (ortaklaşa bütçe) — ayrı PRD
- Mobil (React Native) — ayrı PRD
- Subscription plan kilidi (Premium feature flag)

---

## 10. Security & Data Privacy

- Her API endpoint `[Authorize]` + TenantId filtresi — çapraz tenant erişimi mümkün değil
- Tüm finansal işlemler Wixi Audit Log'a yazılır
- Yatırım API key'leri `appsettings.json`'da, CI/CD'de secret manager ile inject edilir
- Market data cache tenant-bağımsız — assetCode bilgisi hassas değil (public piyasa verisi)
- Rate limit: Finance endpoint'lerine mevcut `WixiCore` rate limit politikaları uygulanır

---

## 11. Veri Şeması Özeti

```
WixiFinanceCategory
  └── WixiFinanceTransaction (CategoryId FK)
       └── WixiInstallmentPlan (TransactionId FK)
            └── WixiInstallmentDetail (InstallmentPlanId FK)

WixiFinanceBudget
  └── WixiFinanceBudgetCategory (BudgetId FK)
  └── WixiFinanceTransaction (BudgetId FK, nullable)

WixiRecurringTransaction (bağımsız, periyodik transaction üretir)

WixiInvestment
  └── WixiInvestmentValueCache (AssetCode ile loosely coupled)
```

---

## 12. Open Questions

| Soru | Karar Gerekli |
|---|---|
| Finance modülü hangi Subscription plan'a dahil? | Product + Subscription ekibine sor |
| Market data API key yönetimi — Key Vault mı, secrets.json mı? | DevOps |
| BIST hisse sembolleri listesi nereden geliyor? Seed mi, dinamik mi? | Ürün kararı |
| TCMB API key başvurusu yapıldı mı? | İş takibi |
| PDF export için Playwright mı, wkhtmltopdf mı? | Backend ekip tercihi |
| Partnership (ortaklaşa bütçe) bu modüle mi dahil, ayrı modül mü? | Mimari karar |

---

**Sonraki Adım:** Sprint 3 başında `Wixi.Modules.Finance` proje iskeleti + entity migration'ı açmak. Yukarıdaki Open Questions'ları paydaşlarla kapamak.

**Son Güncelleme:** 2026-05-23  
**Hazırlayan:** Ahmet Can Bozkurt (WixiBudget analizi + WixiFinanceTrack 360 kaynak alınarak)
