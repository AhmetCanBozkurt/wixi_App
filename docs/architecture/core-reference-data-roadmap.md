# Core Referans Veri Yol Planı (Roadmap)

> **Tarih:** 2026-05-21  
> **Kapsam:** Lojistik modülü öncesinde Core'a eklenecek ~24 entity  
> **Kaynak:** `definition-cards-gap-analysis.md`  
> **ClickUp:** Multi-Tenant Core (901818217841) + Admin Panel (901818217838)

---

## Genel Strateji

```
Lojistik Modülü yazılmadan önce Core referans altyapısı hazır olmalı.
Her şey Core'da tanımlanır → Lojistik modülü bunları kullanır, kopyalamaz.
```

**4 fazda, 4 sprint:** Her fazda Backend + Admin UI birlikte teslim edilir.

---

## Faz C1 — Coğrafi & Finansal Temel
**Sprint 2 | Bitiş: 2026-06-01 | Öncelik: HIGH**

### Eklenecek Entityler (7 adet)

| Entity | Tablo | Seed |
|--------|-------|------|
| `WixiRegion` | WIXI_REGIONS | Türkiye 7 coğrafi bölge + ticari bölgeler |
| `WixiPort` | WIXI_PORTS | UN/LOCODE — Türkiye limanları |
| `WixiPaymentTerm` | WIXI_PAYMENT_TERMS | Peşin, Net 30/60/90, Vesaik, Akreditif |
| `WixiTaxOffice` | WIXI_TAX_OFFICES | İl bazlı vergi daireleri |
| `WixiIncoterm` | WIXI_INCOTERMS | ICC 2020 — 11 kural (statik seed) |
| `WixiTransportMode` | WIXI_TRANSPORT_MODES | Hava/Deniz/Kara/Demir/Kurye — 5 kayıt |
| `WixiPackageType` | WIXI_PACKAGE_TYPES | Palet/Koli/Varil/Çuval/Ahşap Sandık/Big Bag |

### ClickUp Görevleri
- [Backend](https://app.clickup.com/t/86exp8qnq) — `[Core] Faz C1 — Coğrafi & Finansal Referans Entitiler`
- [Admin UI](https://app.clickup.com/t/86exp8qt8) — `[Admin UI] Faz C1 — Coğrafi & Finansal Tanımlama Sayfaları`

### Admin Sayfaları
```
/admin/definitions/regions
/admin/definitions/ports
/admin/definitions/payment-terms
/admin/definitions/tax-offices
/admin/definitions/incoterms
/admin/definitions/transport-modes
/admin/definitions/package-types
```

---

## Faz C2 — Birim, Hizmet ve GTIP
**Sprint 3 | Bitiş: 2026-06-08 | Öncelik: HIGH**

### Eklenecek Entityler (7 adet)

| Entity | Tablo | Not |
|--------|-------|-----|
| `WixiUnitCategory` | WIXI_UNIT_CATEGORIES | Ağırlık, Hacim, Uzunluk, Alan, Adet |
| `WixiUnit` *(güncelleme)* | WIXI_UNITS | Mevcut entity'e `UnitCategoryId` FK eklenir |
| `WixiUnitConversion` | WIXI_UNIT_CONVERSIONS | 1 ton = 1000 kg — çift yönlü |
| `WixiServiceCategory` | WIXI_SERVICE_CATEGORIES | Nakliye, Gümrükleme, Sigorta, Depolama |
| `WixiService` | WIXI_SERVICES | Faturalabilir hizmet tanımı |
| `WixiProductDescription` | WIXI_PRODUCT_DESCRIPTIONS | Gümrük ürün tanımı (WixiProduct'tan ayrı) |
| `WixiHsCode` | WIXI_HS_CODES | GTIP — hiyerarşik, ParentId, 4 seviye |

### ClickUp Görevleri
- [Backend](https://app.clickup.com/t/86exp8qxn) — `[Core] Faz C2 — Birim, Hizmet ve GTIP Referans Entitiler`
- [Admin UI](https://app.clickup.com/t/86exp8qyx) — `[Admin UI] Faz C2 — Birim, Hizmet ve GTIP Tanımlama Sayfaları`

### Kritik Detay
> `WixiUnit` mevcut entity'dir. `UnitCategoryId` nullable FK olarak eklenir;
> mevcut kayıtlar bozulmaz. Migration'da `AddColumn` yeterli.

---

## Faz C3 — CRM & Organizasyon
**Sprint 4 | Bitiş: 2026-06-15 | Öncelik: NORMAL**

### Eklenecek Entityler (7 adet)

| Entity | Tablo | Not |
|--------|-------|-----|
| `WixiAccountType` | WIXI_ACCOUNT_TYPES | Müşteri, Tedarikçi, Acenta, Gümrük, Banka |
| `WixiAccountSource` | WIXI_ACCOUNT_SOURCES | Referans, Fuar, Website, LinkedIn |
| `WixiAccountRiskClass` | WIXI_ACCOUNT_RISK_CLASSES | Düşük/Orta/Yüksek + CreditLimit |
| `WixiDepartment` | WIXI_DEPARTMENTS | Operasyon, Satış, Muhasebe, IT |
| `WixiBranch` | WIXI_BRANCHES | Şube/ofis — adres + yönetici FK |
| `WixiJobTitle` | WIXI_JOB_TITLES | Müdür, Uzman, Operasyon Sorumlusu |
| `WixiAuthorizationLevel` | WIXI_AUTHORIZATION_LEVELS | Görüntüleyici/Editör/Onaylayıcı/Yönetici |

### ClickUp Görevleri
- [Backend](https://app.clickup.com/t/86exp8r46) — `[Core] Faz C3 — CRM & Organizasyon Referans Entitiler`
- [Admin UI](https://app.clickup.com/t/86exp8r4y) — `[Admin UI] Faz C3 — CRM & Organizasyon Tanımlama Sayfaları`

---

## Faz C4 — Destek Talebi & Belge Şablonu
**Sprint 5 | Bitiş: 2026-06-22 | Öncelik: LOW**

### Eklenecek Entityler (4 adet)

| Entity | Tablo | Not |
|--------|-------|-----|
| `WixiTicketCategory` | WIXI_TICKET_CATEGORIES | Teknik, Fatura, Operasyon, Genel |
| `WixiTicketModule` | WIXI_TICKET_MODULES | ECommerce, Auth, Logistics vb. |
| `WixiSupportTicket` | WIXI_SUPPORT_TICKETS | Helpdesk — TenantId izole, Status enum |
| `WixiDocumentTemplate` | WIXI_DOCUMENT_TEMPLATES | Scriban şablon — CMR, AWB, Proforma, Fatura |

### ClickUp Görevleri
- [Backend](https://app.clickup.com/t/86exp8r6e) — `[Core] Faz C4 — Destek Talebi & Belge Şablonu`
- [Admin UI](https://app.clickup.com/t/86exp8r7d) — `[Admin UI] Faz C4 — Destek Talebi & Belge Şablonu Sayfaları`

---

## Bağımlılık Zinciri

```
C1 Backend ──► C1 Admin UI
     │
     ▼
C2 Backend ──► C2 Admin UI
     │
     ▼
C3 Backend ──► C3 Admin UI
     │
     ▼
C4 Backend ──► C4 Admin UI
```

> Her UI görevi, kendi fazının backend'ini bekliyor (ClickUp'ta `waiting_on` bağımlılığı kuruldu).
> Backend fazları da birbirini sırayla bekliyor.

---

## Toplam: 25 Yeni Entity

| Faz | Backend | Admin Sayfası | Sprint | Bitiş |
|-----|---------|--------------|--------|-------|
| C1 | 7 entity | 7 sayfa | Sprint 2 | 2026-06-01 |
| C2 | 7 entity (+1 güncelleme) | 7 sayfa | Sprint 3 | 2026-06-08 |
| C3 | 7 entity | 7 sayfa | Sprint 4 | 2026-06-15 |
| C4 | 4 entity | 4 sayfa | Sprint 5 | 2026-06-22 |
| **Toplam** | **25 entity** | **25 sayfa** | — | **2026-06-22** |

---

## Sonrası: Lojistik Modülü

Tüm C fazları tamamlandıktan sonra `Wixi.Modules.Logistics` başlar.
Lojistik modülü bu entityleri FK veya string referans olarak kullanır:
- `WixiTransportMode` → Her operasyonun modu
- `WixiPort` → POL (yükleme limanı) / POD (varış limanı)
- `WixiIncoterm` → Teklif ve sipariş koşulları
- `WixiPackageType` → Yük tanımı
- `WixiService` → Faturalabilir kalemler
- `WixiHsCode` → Gümrük beyannamesi
- `WixiPaymentTerm` → Cari vade yapısı
