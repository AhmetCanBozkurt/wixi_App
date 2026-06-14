# M13 — Raporlama & BI

> **Durum:** 🟡 Temel dashboard var, BI yok · **Faz:** 4 (cross-cutting) · **Öncelik:** 🟠 Yüksek · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
Operasyonel dashboard + stratejik analiz (cohort, churn, kâr marjı, ROI). **Cross-cutting**: tüm modüllerden okur, kendi tablosu az; çoğu agregasyon/read-model.

---

## Mevcut Durum (kodda ne var)
| Var | İçerik |
|---|---|
| `AdminDashboardController` (`/admin/dashboard/stats`) | Platform KPI özeti |
| `StoreAdminDashboardController` (`/store-admin/dashboard/stats`) | Tenant KPI özeti |
| Frontend | `AdminDashboardPage`, `DashboardPage`, `StoreAnalyticsPage` |

> Temel istatistik var; **cohort/churn/kâr marjı/ROI/özel rapor/dışa aktarım yok.** M13 = mevcut dashboard'ları genişletme + analitik katman.

## İlgili Tablolar (ideal → mevcut)
Kendi tablosu **yok denecek kadar az** — çoğu mevcut veriden agregasyon/read-model. (İhtiyaç olursa materialized snapshot tablosu.)

| İhtiyaç | Kaynak modül |
|---|---|
| Satış/sipariş/iade özeti | M06, M09 |
| Stok durumu + değer + kritik eşik | M07 |
| Kargo performansı / SLA | M08 |
| Cohort / churn / LTV | M02 (`WixiRfmSnapshot`) |
| Kâr marjı | M06 (`WixiOrderItem.CostPrice`), M12 |
| Kampanya ROI | M11 |
| Destek CSAT / çözüm süresi | M05 |
| Tedarikçi risk/performans | M10 |
| Cari yaşlandırma | M04 |

## Bağımlılıklar
- **Girdi:** **Tüm modüller** (okuyucu). Özellikle M02 RFM snapshot (tarihsel cohort/churn), M06 (ciro/kâr).
- **Çıktı:** Yok (uç katman) — sadece ekran + dışa aktarım.

---

## Detay Tasarım

### 1. Mimari: Read-Model / Agregasyon

> **Karar D-04:** Sorgular ECommerce içinde `Application/Reporting/`. Çoğu **anlık agregasyon query**; ağır olanlar (cohort, churn trendi) **materialized snapshot** (BackgroundService gece hesaplar, D-06).

| Rapor | Yaklaşım |
|---|---|
| Günlük operasyon (satış/sipariş/iade/stok) | Anlık query (mevcut dashboard genişletme) |
| Cohort (müşteri grubu zaman değeri) | `WixiRfmSnapshot` üzerinden (M02 zaten tarihsel tutuyor) |
| Churn | RFM segment geçiş trendi (kural-bazlı; ML sonra — M02 O-C2) |
| Kâr marjı | `WixiOrderItem.CostPrice` vs satış — anlık |
| Kampanya ROI | M11 denormalize istatistik |
| Stok değerleme | M07 `UnitCost × Quantity` |

### 2. Rapor Katalogu (CQRS — `Application/Reporting/`)

| Sorgu | İçerik | Kaynak |
|---|---|---|
| `GetExecutiveDashboardQuery` | KPI özeti: ciro, sipariş, AOV, dönüşüm, aktif müşteri | M06, M02 |
| `GetSalesReportQuery(period, groupBy)` | Ciro zaman serisi, kanal/kategori kırılımı | M06 |
| `GetProfitMarginQuery` | Ürün/kategori bazlı marj (satış − CostPrice) | M06, M12 |
| `GetCohortAnalysisQuery` | Aylık cohort retention/LTV | M02 RFM snapshot |
| `GetChurnReportQuery` | Risk altı/kayıp müşteri + segment geçişi | M02 |
| `GetInventoryReportQuery` | Stok değeri, kritik eşik, devir hızı | M07 |
| `GetCargoPerformanceQuery` | Teslim süresi, SLA ihlal oranı, firma kıyas | M08 |
| `GetSupportStatsQuery` | CSAT, ort. çözüm, SLA ihlal | M05 |
| `GetReturnAnalyticsQuery` | İade oranı, neden/ürün kırılımı | M09 |
| `GetCampaignRoiQuery` | Kampanya açılma/dönüşüm/gelir | M11 |
| `GetSupplierScorecardQuery` | Tedarikçi performans/risk | M10 |
| `GetCariAgingQuery` | Cari vade yaşlandırma | M04 |

### 3. Özelleştirilebilir Rapor & Dışa Aktarım
- **Drag-drop rapor oluşturucu** (sonraki aşama): metrik + boyut + filtre seçimi → tablo/grafik.
- **Dışa aktarım:** her rapor Excel/CSV (EPPlus/CsvHelper) + zamanlanmış e-posta (mevcut mail altyapısı + BackgroundService).
- **API erişimi:** harici BI araçları (PowerBI/Metabase) için read endpoint.

---

### 4. Endpoint'ler

| Katman | Metot | Route |
|---|---|---|
| Store-admin | GET stats (mevcut) | `/store-admin/dashboard/stats` 🟡 genişlet |
| Store-admin | GET (her rapor) | `/store-admin/reports/{sales\|profit\|cohort\|churn\|inventory\|cargo\|support\|returns\|campaigns\|suppliers\|cari-aging}` |
| Store-admin | GET{report}/export?format=xlsx\|csv | `/store-admin/reports/{report}/export` |
| Admin | GET stats (mevcut) | `/admin/dashboard/stats` 🟡 |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| `StoreAnalyticsPage` | 🟡 genişlet | Sekmeli BI: Satış · Kâr · Müşteri (cohort/churn) · Stok · Kargo · Destek · İade · Kampanya |
| `DashboardPage` / `AdminDashboardPage` | 🟡 | KPI kartları + trend grafikleri |
| Rapor dışa aktarım | ❌ yeni | Excel/CSV indir + zamanlanmış mail |

> Grafik kütüphanesi mevcut frontend stack'iyle uyumlu; zorunlu shared UI tablolar `AdvancedDataTable`.

---

## Açık Sorular
- **O-B1:** Raporlar anlık query mi materialized snapshot mı? → öneri: hibrit — operasyonel anlık, cohort/churn gece snapshot (büyük tenant performansı).
- **O-B2:** Churn ML mi kural mı? → M02 O-C2 ile aynı: kural-bazlı başla.
- **O-B3:** Drag-drop rapor oluşturucu hangi faz? → öneri: sabit rapor katalogu önce, özelleştirme sonra.
- **O-B4:** Harici BI (PowerBI) entegrasyonu öncelik mi? → öneri: önce dahili + Excel/CSV.

## Detay Tasarım (TODO)
- [ ] Mevcut `dashboard/stats` genişletme (KPI + trend)
- [ ] Rapor katalogu CQRS (Application/Reporting/) — 11 rapor query
- [ ] Cohort/churn materialized snapshot (BackgroundService, D-06) — M02 RFM üzerine
- [ ] Kâr marjı (M06 CostPrice) + stok değerleme (M07) raporları
- [ ] Excel/CSV dışa aktarım + zamanlanmış e-posta
- [ ] `StoreAnalyticsPage` sekmeli BI genişletme
- [ ] (Sonra) drag-drop rapor oluşturucu + harici BI API
