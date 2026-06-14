# CRM — Mimari Karar Kaydı (Decision Log)

> CRM modül analizinde verilen **cross-cutting kararların tek kaynağı**. Her karar tüm modülleri bağlar. Yeni modül tasarlarken önce buraya bak.
> Format: `D-xx` verilmiş karar · `O-xx` açık (bekleyen) karar.

---

## ✅ Verilen Kararlar (7/7 — tümü kapalı)

### D-01 — Kargo firma yapısı: Master katalog + Per-tenant anahtar
**Tarih:** 2026-06-14 · **Etkiler:** M00, M08

Kargo firmaları **ikiye bölünür**:
- **Master `WixiCargoCarrier`** (Core, referans) — platform geneli firma kataloğu: `Code, Name, NameEn, LogoUrl, TrackingUrlTemplate, IsInternational, SortOrder`. **API anahtarı YOK.**
- **Per-tenant `WixiCargoCarrierSetting`** (ECommerce) — mağazanın açtığı firmalar + şifreli `ApiKey/Secret/CustomerCode`, `SlaDays`, `IsDefault`.
- **Bağlantı:** `WixiCargoCarrierSetting.CarrierCode` → `WixiCargoCarrier.Code` (string-kopya, çapraz-DB FK yok).

**Gerekçe:** Her mağaza "Yurtiçi Kargo"yu sıfırdan tanımlamasın, ortak listeden seçsin; ama API kimliği mağazaya özel ve izole kalsın.

---

### D-02 — Dosya saklama: Harici/tam URL yasak
**Tarih:** 2026-06-14 · **Etkiler:** TÜM modüller (görsel/dosya alanı olan her yer)

**Kural:** Sahip olduğumuz dosyalar (görsel, logo, banner, belge, PDF, etiket, foto) **harici/tam URL string olarak saklanmaz.** İki kabul edilen yol:
1. **VARBINARY** (DB blob) — küçük/hassas belgeler (fatura PDF, imzalı belge)
2. **Sunucu yüklemesi + `relativePath`** — görseller (ürün/logo/banner). Entity `https://host/...` değil `/uploads/{slug}/{guid}.ext` tutar; host **serve anında** çözülür.

- Tüm dosyalar **`WixiFile`** ile izlenir (metadata + orphan temizliği).
- **Varsayılan (hibrit):** görsel → sunucu disk + relativePath · küçük/hassas belge → VARBINARY.

**⚠️ İstisna — dosya OLMAYAN dış linkler kural dışıdır** (bunlar URL string kalır):
| Alan | Neden istisna |
|---|---|
| `WixiCargoCarrier.TrackingUrlTemplate` | Kargo firmasının takip sayfası linki (dosya değil) |
| `WixiBrand.WebsiteUrl` | Marka web sitesi (dosya değil) |

**Mevcut düzeltilecekler:** `WixiProductMedia.Url`, `WixiBrand.LogoUrl`, `WixiCategory.ImageUrl` tam URL tutuyor → relativePath migrate. `StoreAdminUploadController` tam public URL döndürüyor → relativePath. (`WixiUser.ProfilePicture` zaten VARBINARY ✅.)

**Yeni modüllerde uygulanacak dosya alanları:** RMA foto (M09), ticket eki (M05), kargo etiketi `LabelUrl` (M08), fatura `PdfUrl` (M12), tedarikçi belgeleri (M10).

---

### D-03 — Referans veri yerleşimi: Master / Per-Tenant / Enum çerçevesi
**Tarih:** 2026-06-14 · **Etkiler:** TÜM modüller

| Nereye? | Kriter | Örnek |
|---|---|---|
| 🏛️ Master | Platform geneli, her mağazada aynı, ortak sözlük | Birim, Liman, Vergi Dairesi, Para Birimi, Kargo katalog |
| 🏪 Per-Tenant | Mağazaya özel veri/ayar | Müşteri, sipariş, kargo API key, sadakat kuralı |
| 🔢 Enum (kod) | Küçük, sabit, iş mantığı (veri değil) | Sipariş durumu, ticket önceliği, iade nedeni |

**Sonuç:** Master referans katmanı CRM için ~%95 hazır; yeni REF tablosu gerekmiyor (tek yeni: kargo katalog).

---

### D-04 — CRM modül sınırı: ECommerce içinde
**Tarih:** 2026-06-14 · **Etkiler:** M02, M05 (ve tüm yeni CRM tabloları)

Yeni CRM tabloları **`Wixi.Modules.ECommerce` içinde** yaşar: `Application/Crm/<Feature>/` (CQRS) + `Domain/Entities/` (`Wixi*` prefix) + DbSet'ler `ECommerceDbContext`'e eklenir.

**Gerekçe:** Tablolar `WixiCustomer`/`WixiOrder`'a FK ile bağlı, aynı per-tenant DB. Ayrı `Wixi.Modules.Crm` → aynı DB'de çapraz-context FK karmaşası + yeni DbContext/provisioner maliyeti. Modül şişerse ileride ayrıştırılır.

---

### D-05 — Provisioner: Mevcut `ECommerceTenantProvisioner`
**Tarih:** 2026-06-14 · **Etkiler:** M02–M13 (per-tenant)

Yeni per-tenant tablolar `ECommerceDbContext`'e DbSet olarak eklenir; mevcut `ECommerceTenantProvisioner` (`Database.MigrateAsync()`) **otomatik migrate eder**. Yeni provisioner gerekmez. (D-04'ten doğal sonuç.)

---

### D-06 — Arka plan job pattern'i: `BackgroundService`
**Tarih:** 2026-06-14 · **Etkiler:** M02 (RFM), M03 (puan sona erme), M05 (SLA), M08 (tracking), M11 (kampanya tetik)

Zamanlı/arka plan işleri mevcut `BackgroundService` pattern'i ile yazılır: `ExecuteAsync` + `CreateScope` + `Task.Delay`. **Mevcut örnekler:** `MailingBackgroundWorker`, `SubscriptionExpiryBackgroundWorker`, `TcmbSyncBackgroundWorker` (Core/Infrastructure/Services).

---

### D-07 — Cari/Tedarikçi: `CARI_*` / `SUPPLIER_*` ayrı tablolar
**Tarih:** 2026-06-14 · **Etkiler:** M04, M10

Mevcut birleşik `WixiContact` (`ContactType`) + `WixiCariLedger` **ayrıştırılır** (dokümana birebir uyum):
- **Cari (B2B):** `CariAccount` + `CariContact` (çoklu kişi) + `CariAddress` (çoklu adres) + `CariTransaction` + `CariReconciliation`
- **Tedarikçi:** `SupplierAccount` + `SupplierContact` + `SupplierAddress` + `SupplierProduct`

**Migration yolu:** mevcut `WixiContact` (Customer/Both) → `CariAccount`; (Supplier/Both) → `SupplierAccount`; `WixiCariLedger` → `CariTransaction`. Mevcut `StoreCariPage` yeni yapıya uyarlanır.

**Gerekçe:** Net cari/tedarikçi ayrımı, dokümandaki ideal yapı. Migration maliyeti kabul edildi.

---

## Karar Geçmişi
| Karar | Durum | Tarih |
|---|---|---|
| D-01 Kargo yapısı | ✅ Verildi | 2026-06-14 |
| D-02 Dosya saklama | ✅ Verildi | 2026-06-14 |
| D-03 Referans çerçevesi | ✅ Verildi | 2026-06-14 |
| D-04 CRM modül sınırı (ECommerce içinde) | ✅ Verildi | 2026-06-14 |
| D-05 Provisioner (mevcut) | ✅ Verildi | 2026-06-14 |
| D-06 Job pattern (BackgroundService) | ✅ Verildi | 2026-06-14 |
| D-07 Cari/Tedarikçi (ayrı tablolar) | ✅ Verildi | 2026-06-14 |

**Tüm cross-cutting kararlar verildi — açık karar kalmadı.** ✅
