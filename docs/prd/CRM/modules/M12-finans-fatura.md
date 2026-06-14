# M12 — Finans & Fatura

> **Durum:** ❌ Greenfield · **Faz:** 4 · **Öncelik:** 🔴 Kritik · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
e-Fatura/e-Arşiv (GİB), otomatik fatura, müşteri portalı fatura erişimi, kâr marjı, ERP entegrasyonu. **E-ticaret faturası** tamamen yok.

---

## Mevcut Durum (kodda ne var)
- **E-ticaret fatura entity'si yok.** Ödeme tarafı M06'da (`WixiPaymentLog` — Iyzipay/Stripe). Cari hareket M04'te (`WixiCariLedger`/`WixiCariTransaction`).
- ⚠️ **Karıştırma:** `Wixi.Modules.Finance` (`WixiFinanceBudget/Category/Transaction`, `WixiInstallmentPlan`, `WixiRecurringTransaction`) **bu modül DEĞİL** — o **kişisel/bütçe finansı** (ayrı modül, ayrı DB, finance-module-prd / personal-finance-prd). M12 = **e-ticaret satış faturası**.

> **Yerleşim (D-04):** `WixiInvoice` `ECOM_ORDERS`'a FK bağlı → ECommerce modülü içinde (`Application/Crm/Finance/`), `ECommerceDbContext`. Personal Finance modülüyle ilgisi yok.

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Durum |
|---|---|---|
| FIN_INVOICES | `WixiInvoice` (yeni) | ❌ |
| (Ödeme/tahsilat) | `WixiPaymentLog` | 🟡 M06 |
| (Cari/ERP) | `WixiCariTransaction` | 🟡 M04 |

## Bağımlılıklar
- **Girdi:** M06 Sipariş (fatura kaynağı + breakdown + CostPrice), M02 Müşteri / M04 Cari (fatura adresi/cari), M00 (vergi dairesi, para birimi).
- **Çıktı:** M04 (cari `Invoice` transaction), M13 (ciro, kâr marjı), storefront (müşteri fatura erişimi).

---

## Detay Tasarım

### 1. Veri Modeli

#### 1.1. `WixiInvoice`
```
Id, InvoiceNumber (unique 'F-2026-00001')
InvoiceType enum { eInvoice, eArchive, Manual }
OrderId (FK), CustomerId?, CariId?
// Fatura adresi snapshot (M06 BillTo ile tutarlı)
BillToName, BillToTaxNumber, BillToTaxOfficeName, BillToAddress, BillToCity
// Tutarlar (M06 breakdown'dan)
SubTotal, TaxAmount, TotalAmount, CurrencyCode
// GİB entegrasyonu
GibStatus enum { Pending, Sent, Approved, Rejected, Error }
GibUuid, GibEttn  string?
PdfData/PdfPath   // D-02: fatura PDF küçük/hassas → VARBINARY önerilir
IssuedAt
+ IAuditable
```
> Fatura kalemleri ayrı tabloya gerek yok — `WixiOrderItem` (M06) snapshot'ı zaten var; fatura PDF'i ondan üretilir. (İhtiyaç olursa `WixiInvoiceItem` eklenir.)

---

### 2. İş Kuralları & Akış

| Kural | Mantık |
|---|---|
| **Otomatik fatura** | M06 `OrderDeliveredEvent` (veya Paid) → `WixiInvoice` taslak oluştur (event, D-04). |
| **GİB gönderimi** | `WixiInvoice` → GİB entegratör adaptörü (`IGibProvider`) → `GibUuid/Ettn` döner, `GibStatus=Approved`. Hata → retry (BackgroundService, D-06). |
| **PDF** | Onaylı fatura PDF'i üretilir (D-02 varbinary), müşteri portalında erişilir. |
| **Cari bağı** | B2B fatura → M04 `WixiCariTransaction (Invoice, Debit)`. |
| **Kâr marjı** | `WixiOrderItem.CostPrice` (M06) vs satış → marj; rapor M13. |
| **İade** | M09 iade tamamlanınca → iade faturası / `CreditNote` (M04). |

> **GİB entegratörü:** harici sağlayıcı (entegratör) — adaptör arkasında soyutlanır (`IGibProvider`), kargo `ICargoProvider` deseniyle aynı. Sağlayıcı seçimi açık (O-F1).

---

### 3. CQRS (`Application/Crm/Finance/`)

| Komut | İş |
|---|---|
| `CreateInvoiceCommand` | Siparişten fatura (otomatik event veya manuel) |
| `SendInvoiceToGibCommand` | GİB'e gönder (adaptör) |
| `CancelInvoiceCommand` | İptal / iade faturası |
| `RegenerateInvoicePdfCommand` | PDF yeniden üret |

| Sorgu | İş |
|---|---|
| `GetInvoicesQuery` / `GetInvoiceByIdQuery` | Liste/detay (GİB durum filtre) |
| `GetMyInvoicesQuery` | Müşteri faturaları (storefront portal) |
| `GetInvoicePdfQuery` | PDF indir (D-02) |
| `GetRevenueReportQuery` | Ciro + kâr marjı (M13'e taşınabilir) |

> **Event (D-04):** `InvoiceApprovedEvent` → M04 cari transaction.

---

### 4. Endpoint'ler

| Katman | Metot | Route |
|---|---|---|
| Store-admin | GET · GET{id} · POST · POST{id}/send-gib · POST{id}/cancel | `/store-admin/invoices` |
| Store-admin | GET{id}/pdf | `/store-admin/invoices/{id}/pdf` |
| Storefront | GET my · GET{id}/pdf | `/public/storefront/invoices` |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| Store-admin fatura listesi | ❌ yeni | Liste + GİB durum + gönder/iptal + PDF |
| Storefront fatura | ❌ yeni | "Faturalarım" + PDF indir (sipariş detayından) |

> Zorunlu shared UI; PDF D-02.

---

## Açık Sorular
- **O-F1:** GİB entegratör sağlayıcısı hangisi? (örn. Logo e-Fatura, Foriba, Uyumsoft) → `IGibProvider` adaptör arkasında, seçim ileride.
- **O-F2:** ERP entegrasyonu (Logo/Netsis/SAP) hangi faz/öncelik? → öneri: çekirdek fatura sonrası, ayrı çalışma.
- **O-F3:** Kâr marjı raporu M12'de mi M13'te mi? → öneri: M13 (raporlama merkezi), veri M06 CostPrice'tan.
- **O-F4:** `WixiInvoiceItem` ayrı tablo gerekli mi? → öneri: başlangıçta `WixiOrderItem` snapshot yeterli.

## Detay Tasarım (TODO)
- [ ] `WixiInvoice` entity + DbSet + migration (ECommerce — Personal Finance ile karıştırma!)
- [ ] `IGibProvider` adaptör soyutlaması (sağlayıcı sonra)
- [ ] Otomatik fatura: `OrderDeliveredEvent` → taslak (event, D-04)
- [ ] GİB gönderim + retry (BackgroundService, D-06)
- [ ] Fatura PDF üretimi (D-02 varbinary)
- [ ] `InvoiceApprovedEvent` → M04 cari transaction
- [ ] CQRS (Application/Crm/Finance/) + endpoint'ler
- [ ] Frontend: store-admin fatura + storefront faturalarım
- [ ] (Sonra) ERP senkronizasyon
