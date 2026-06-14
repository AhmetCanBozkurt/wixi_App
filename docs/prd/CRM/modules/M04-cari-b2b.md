# M04 — Cari / B2B

> **Durum:** 🟡 Basit cari mevcut, D-07 ile ayrıştırma · **Faz:** 2 · **Öncelik:** 🟠 Yüksek · **Detay:** 🔨 Tasarlanıyor
> [← INDEX'e dön](../INDEX.md) · [DECISIONS.md](../DECISIONS.md)

## Kapsam
B2B firma cari hesapları: çoklu yetkili kişi, çoklu adres, borç/alacak hareketleri, bakiye, kredi/risk limiti, dönemsel mutabakat. Mevcut `WixiContact` basit birleşik düz kart — **D-07 ile cari `CARI_*` olarak ayrıştırılıp zenginleştirilir** (tedarikçi → M10).

---

## Mevcut Durum (kodda ne var)

| Dosya | İçerik |
|---|---|
| `WixiContact` | `Name, Type(ContactType: Supplier/Customer/Both), TaxNumber, TaxOffice, Email, Phone, Address(string), City, ContactPersonName(string), Notes, Balance, LedgerEntries[]` |
| `WixiCariLedger` | `ContactId, EntryType, Amount, Description, ReferenceNo, MovementDate, BalanceAfter` |
| `Application/Cari/` | `CreateContact`, `UpdateContact`, `CreateLedgerEntry`, `GetContacts`, `GetContactLedger` |
| `StoreAdminCariController` (`/store-admin/cari`) | GET · POST · PUT{id} · GET{id}/ledger · POST{id}/ledger |
| Frontend | `StoreCariPage` (route `/store-admin/cari`) |

**Yani:** çalışan basit bir cari var (kart + hareket + bakiye). Ama **tek `ContactPersonName`** (çoklu kişi yok), **tek `Address` string** (çoklu adres yok), kredi/ödeme/lojistik alanları, mutabakat, döviz yok. Cari ve tedarikçi `Type` ile aynı tabloda.

---

## ✅ D-07 Kararı: `CARI_*` ayrı tablolar

Mevcut `WixiContact` (Customer/Both) → `WixiCariAccount` migrate; `WixiCariLedger` → `WixiCariTransaction`. Tedarikçi (Supplier/Both) → M10 `WixiSupplierAccount`.

## İlgili Tablolar (ideal → mevcut)
| İdeal | Hedef Entity | Mevcut | Durum |
|---|---|---|---|
| CARI_ACCOUNTS | `WixiCariAccount` (yeni) | `WixiContact` (Customer/Both) | 🟡 Migrate + zenginleştir |
| CARI_TRANSACTIONS | `WixiCariTransaction` (yeni) | `WixiCariLedger` | 🟡 Migrate + alan ekle |
| CARI_CONTACTS | `WixiCariContact` (yeni) | tek `ContactPersonName` | ❌ Çoklu kişi |
| CARI_ADDRESSES | `WixiCariAddress` (yeni) | tek `Address` string | ❌ Çoklu adres |
| CARI_RECONCILIATIONS | `WixiCariReconciliation` (yeni) | — | ❌ Mutabakat |

## Bağımlılıklar
- **Girdi:** M00 (vergi dairesi, ödeme koşulu, liman, incoterm — string kopya D-03), M02 (B2C müşteriyle ortak desenler).
- **Çıktı:** M06 Sipariş (B2B `CariId`), M12 Finans (cari fatura → transaction), M05 Destek (cari talep).

---

## Detay Tasarım

### 1. Veri Modeli

> **Karar D-04/D-05:** ECommerce içinde `Application/Crm/Cari/`, DbSet `ECommerceDbContext`. **Migration: D-07 veri taşıma idempotent** (M10 ile koordineli — `Both` tipi hem cari hem tedarikçi olur).

#### 1.1. `WixiCariAccount`
```
Id
// Firma kimlik
CompanyName, ShortName, CariCode (unique 'C-00001')
// Vergi & ticaret
TaxNumber, TaxOfficeName (M00 kopya), TradeRegisterNo
// Ticari koşullar
CurrencyCode, PaymentTermName/Days (M00 kopya), CreditLimit, RiskLimit
// Lojistik tercihleri (M00 string kopya, D-03)
PreferredPortName, PreferredTransportMode, PreferredIncotermCode
// Bakiye (denormalize)
TotalDebit, TotalCredit, Balance   // = Debit - Credit
// İletişim
Website, Email, Phone
+ IAuditable
```

#### 1.2. `WixiCariContact` (çoklu yetkili kişi)
```
Id, CariId (FK)
FirstName, LastName, Title, Department, Email, Phone, Mobile
IsPrimary bool
+ IAuditable
```

#### 1.3. `WixiCariAddress` (çoklu adres)
```
Id, CariId (FK)
AddressType enum { Headquarter, Warehouse, Branch, Invoice, Delivery }
AddressTitle, AddressLine1/2, Country, City, District, ZipCode
ContactName, ContactPhone, IsDefault
+ IAuditable
```

#### 1.4. `WixiCariTransaction` (mevcut `WixiCariLedger` genişletmesi)
```
Id, CariId (FK)
TransactionType enum { Invoice, Payment, Return, DebitNote, CreditNote, Opening }
Direction       enum { Debit, Credit }
Amount, CurrencyCode, ExchangeRate, AmountTRY
// İlişki (polymorphic — D-03 desen)
ReferenceId Guid?, ReferenceType enum { Invoice, Order, Return }, ReferenceNo
// Vade
DueDate, IsPaid, PaidAt
Description, BalanceAfter, CreatedByUser
+ IAuditable
```

#### 1.5. `WixiCariReconciliation` (mutabakat)
```
Id, CariId (FK), PeriodStart, PeriodEnd
OpeningBalance, ClosingBalance, TotalDebit, TotalCredit
Status enum { Draft, SentToCustomer, Confirmed, Disputed }
SentAt, ConfirmedAt, Notes
+ IAuditable
```

---

### 2. İş Kuralları

| Kural | Mantık |
|---|---|
| **Bakiye** | Her `WixiCariTransaction` yazıldığında `WixiCariAccount.TotalDebit/Credit/Balance` aynı transaction'da güncellenir (denormalize, M03 bakiye deseniyle aynı). `BalanceAfter` hareket anı snapshot. |
| **Kredi limiti** | B2B sipariş/fatura öncesi `Balance + yeniTutar > CreditLimit` ise uyarı/blok (store-admin kararı). |
| **B2B sipariş bağı** | M06 `WixiOrder.CariId` dolu sipariş tamamlanınca → `WixiCariTransaction (Invoice, Debit)` otomatik (MediatR event). |
| **Mutabakat** | Dönem hareketlerinden `WixiCariReconciliation` üretilir; müşteriye gönder → onay/itiraz. |
| **Döviz** | `AmountTRY = Amount × ExchangeRate` (M00 ExchangeRate'ten); bakiye TRY bazlı tutulur. |

---

### 3. CQRS (`Application/Crm/Cari/`)

**Mevcut taşınır/genişletilir:** `GetContacts`→`GetCariAccounts`, `CreateContact`→`CreateCariAccount`, `CreateLedgerEntry`→`CreateCariTransaction`, `GetContactLedger`→`GetCariLedger`.

**Yeni:**
| Komut/Sorgu | İş |
|---|---|
| `UpsertCariContactCommand` / `DeleteCariContactCommand` | Çoklu yetkili kişi |
| `UpsertCariAddressCommand` / `DeleteCariAddressCommand` | Çoklu adres |
| `CreateReconciliationCommand` / `SendReconciliationCommand` / `ConfirmReconciliationCommand` | Mutabakat akışı |
| `GetCariAccount360Query` | Kart + kişiler + adresler + ekstre + bakiye + açık fatura |
| `GetCariStatementQuery(cariId, period)` | Cari ekstresi (PDF — D-02 varbinary) |
| `GetAgingReportQuery` | Vade analizi (yaşlandırma) — M13 |

---

### 4. Endpoint'ler (`/store-admin/cari` genişletme)

| Metot | Route | Durum |
|---|---|---|
| GET · POST · PUT{id} | `/store-admin/cari` | ✅ (alan zenginleşir) |
| GET{id}/ledger · POST{id}/ledger | `/store-admin/cari/{id}/ledger` | ✅ (transaction zenginleşir) |
| GET | `/store-admin/cari/{id}` (360°) | ❌ yeni |
| GET/POST/DELETE | `/store-admin/cari/{id}/contacts` | ❌ yeni |
| GET/POST/DELETE | `/store-admin/cari/{id}/addresses` | ❌ yeni |
| GET/POST | `/store-admin/cari/{id}/reconciliations` (+send/confirm) | ❌ yeni |
| GET | `/store-admin/cari/{id}/statement` | ❌ yeni (ekstre) |
| GET | `/store-admin/cari/aging` | ❌ yeni (yaşlandırma) |

---

### 5. Frontend

| Sayfa | Durum | İş |
|---|---|---|
| `StoreCariPage` | 🟡 genişlet | Liste + kredi/bakiye/risk kolonları |
| Cari detay (360°) | ❌ yeni | Sekmeler: Genel · Yetkililer · Adresler · Ekstre · Mutabakat (her biri `Modal` CRUD) |

> Zorunlu shared UI; ekstre/mutabakat PDF D-02 (varbinary). Tutarlar `Input` number.

---

## Açık Sorular
- **O-CA1:** D-07 migration — `Both` tipi cari hem `WixiCariAccount` hem `WixiSupplierAccount`'a mı kopyalanır, ortak bir referansla mı bağlanır? → öneri: iki ayrı kayıt (bağımsız ticari ilişki), ortak `TaxNumber` ile eşlenebilir.
- **O-CA2:** Kredi limiti aşımı blok mu uyarı mı? → öneri: store-admin ayarı (varsayılan uyarı).
- Bakiye trigger ile mi (DB) uygulama katmanında mı güncellensin? → öneri: uygulama (test edilebilir, mevcut desen).

## Detay Tasarım (TODO)
- [ ] **D-07 Migration:** `WixiContact`(Customer/Both)→`WixiCariAccount`, `WixiCariLedger`→`WixiCariTransaction` (idempotent, M10 koordineli)
- [ ] `WixiCariAccount` entity (kredi/ödeme/lojistik/bakiye)
- [ ] `WixiCariContact` + `WixiCariAddress` (çoklu) entity
- [ ] `WixiCariTransaction` (Direction/DueDate/Reference/döviz)
- [ ] `WixiCariReconciliation` entity + akış
- [ ] CQRS (Application/Crm/Cari/) + B2B sipariş→transaction event (M06)
- [ ] Endpoint'ler (360, contacts, addresses, reconciliation, statement, aging)
- [ ] `StoreCariPage` genişletme + cari detay sekmeli ekran
- [ ] Ekstre/mutabakat PDF (D-02 varbinary)
