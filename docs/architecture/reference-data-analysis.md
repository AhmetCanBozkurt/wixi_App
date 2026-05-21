# Wixi Platform — Referans / Tanımlama Kartları Analizi

> **Tarih:** 2026-05-21  
> **Kapsam:** Core modülde bulunması gereken tüm referans (lookup) tabloları  
> **Mevcut duruma göre:** Mevcut entity incelemesi + boşluk analizi

---

## 1. Mevcut Durum (Ne Var?)

Şu anda `Wixi.Modules.Core`'da tanımlı referans tablolar:

| Tablo | Entity | Durum |
|-------|--------|-------|
| Dil | `WixiLanguage` | ✅ Tam |
| Para Birimi | `WixiCurrency` | ✅ Tam (TCMB senkron) |
| Kur Oranı | `WixiExchangeRate` | ✅ Tam |
| Sistem Modülü | `WixiModule` | ✅ Tam |
| Abonelik Planı | `WixiSubscriptionPlan` | ✅ Tam |
| Mail Şablonu | `WixiMailTemplate` | ✅ Tam |
| Tema Şablonu | `WixiThemeTemplate` | ✅ Tam |

**ECommerce modülündeki mevcut adres yapısı (`WixiAddress`):**
```csharp
// ŞU AN — serbest metin, doğrulama yok, otomatik tamamlama yok
public string City { get; set; }     // "İstanbul"
public string District { get; set; } // "Kadıköy"
public string? ZipCode { get; set; } // "34710"
```

**Kritik eksikler:** Ülke, İl, İlçe, Mahalle, Posta Kodu, Vergi Oranı, Kargo Firması, Birim, Ödeme Yöntemi, Banka, Zaman Dilimi, Sektör Kodu.

---

## 2. Coğrafi Hiyerarşi (Geographic Hierarchy)

```
WixiCountry (Ülke)
└── WixiProvince (İl / Eyalet)
    └── WixiDistrict (İlçe / Şehir)
        └── WixiNeighborhood (Mahalle / Semt)
            └── PostalCode (alanda taşınır)

WixiPostalCode (Posta Kodu — ayrı tablo, opsiyonel)
    — CountryId + ProvinceId + DistrictId FK içerir
```

### 2.1 WixiCountry — Ülke

**Modül:** Core  
**Seed:** ISO 3166-1 — ~250 ülke, deployment'ta otomatik yüklenir  
**Admin yönetimi:** Sadece IsActive, SortOrder düzenlenebilir

```csharp
public class WixiCountry
{
    public int Id { get; set; }              // int (küçük tablo, Guid gereksiz)
    public string Alpha2 { get; set; }       // "TR"  — ISO 3166-1 Alpha-2
    public string Alpha3 { get; set; }       // "TUR" — ISO 3166-1 Alpha-3
    public int NumericCode { get; set; }     // 792
    public string Name { get; set; }         // "Türkiye" — yerel dilde
    public string NameEn { get; set; }       // "Turkey"
    public string? PhonePrefix { get; set; } // "+90"
    public string? FlagEmoji { get; set; }   // "🇹🇷"
    public string? FlagCode { get; set; }    // "TR" (FlagCDN / twemoji için)
    public string Continent { get; set; }    // "AS" — AF/AN/AS/EU/NA/OC/SA
    public string? DefaultCurrencyCode { get; set; } // "TRY" — FK WixiCurrency.Code
    public string? DefaultLanguageCode { get; set; } // "tr-TR" — FK WixiLanguage.Code
    public string? DefaultTimezoneCode { get; set; } // "Europe/Istanbul"
    public string? AddressFormatJson { get; set; }   // Adres sıralaması (ülkeye göre farklı)
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    public ICollection<WixiProvince> Provinces { get; set; }
}
```

**Neden AddressFormatJson?**  
Türkiye'de adres sırası: Mahalle → İlçe → İl → Posta Kodu  
ABD'de: Street → City → State → ZIP  
Almanya'da: Straße → PLZ → Stadt  
Bu alan checkout formunun dinamik render edilmesini sağlar.

---

### 2.2 WixiProvince — İl / Eyalet

**Modül:** Core  
**Seed:** Türkiye için 81 il (öncelik), diğer ülkeler isteğe bağlı  
**Admin yönetimi:** CRUD + Excel/CSV import

```csharp
public class WixiProvince
{
    public int Id { get; set; }
    public int CountryId { get; set; }       // FK → WixiCountry
    public WixiCountry? Country { get; set; }
    public string Code { get; set; }         // "TR-34" — ISO 3166-2
    public string Name { get; set; }         // "İstanbul"
    public string? NameEn { get; set; }      // "Istanbul"
    public ProvinceType Type { get; set; }   // Province / State / Region / County
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<WixiDistrict> Districts { get; set; }
}

public enum ProvinceType { Province, State, Region, County, Prefecture }
```

---

### 2.3 WixiDistrict — İlçe

**Modül:** Core  
**Seed:** Türkiye için ~973 ilçe  
**Admin yönetimi:** CRUD, ProvId'ye göre filtrelenmiş

```csharp
public class WixiDistrict
{
    public int Id { get; set; }
    public int ProvinceId { get; set; }     // FK → WixiProvince
    public WixiProvince? Province { get; set; }
    public string Name { get; set; }        // "Kadıköy"
    public string? NameEn { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<WixiNeighborhood> Neighborhoods { get; set; }
}
```

---

### 2.4 WixiNeighborhood — Mahalle / Semt

**Modül:** Core  
**Seed:** Türkiye için PTT veritabanından (~50.000 mahalle)  
**Admin yönetimi:** Ağır veri — import/export önerilir, UI sadece arama

```csharp
public class WixiNeighborhood
{
    public int Id { get; set; }
    public int DistrictId { get; set; }     // FK → WixiDistrict
    public WixiDistrict? District { get; set; }
    public string Name { get; set; }        // "Moda Mahallesi"
    public string? PostalCode { get; set; } // "34710" — Türkiye'de mahalle bazlı
    public bool IsActive { get; set; } = true;
}
```

**Neden PostalCode mahallede taşınıyor?**  
Türkiye'de her mahallenin sabit bir PTT posta kodu vardır.  
ABD / Almanya için ise `WixiPostalCode` ayrı tablo daha uygun.

---

### 2.5 WixiPostalCode — Posta Kodu (Bağımsız Tablo)

**Modül:** Core  
**Kullanım:** Türkiye dışı ülkeler veya çoklu alan kapsayan kodlar  
**Seed:** Opsiyonel — PTT API, Zippopotam API, GeoNames

```csharp
public class WixiPostalCode
{
    public int Id { get; set; }
    public int CountryId { get; set; }
    public int? ProvinceId { get; set; }
    public int? DistrictId { get; set; }
    public string Code { get; set; }        // "34710", "10115", "SW1A 1AA"
    public string? AreaName { get; set; }   // Koda bağlı yer adı
    public decimal? Latitude { get; set; }  // Geo-koordinat (opsiyonel)
    public decimal? Longitude { get; set; }
    public bool IsActive { get; set; } = true;
}
```

---

## 3. Vergi Tanımları (Tax Reference Data)

### 3.1 WixiTaxCategory — KDV Kategorisi

**Neden gerekli:** Türkiye'de farklı ürün kategorileri farklı KDV dilimlerine girer.  
Gıda → %1, Tekstil → %20, Teknoloji → %20, Kitap → %0

```csharp
public class WixiTaxCategory
{
    public int Id { get; set; }
    public string Code { get; set; }         // "kdv_1", "kdv_10", "kdv_20", "exempt"
    public string Name { get; set; }         // "KDV %1 (İndirimli)"
    public string? Description { get; set; }
    public bool IsDefault { get; set; }      // Ürün yaratırken varsayılan
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<WixiTaxRate> Rates { get; set; }
}
```

### 3.2 WixiTaxRate — Vergi Oranı

**Neden ülke + tarih bazlı:** KDV oranları ülkeden ülkeye ve zaman içinde değişir.  
Türkiye 2023'te %18 → %20 değişikliği gibi.

```csharp
public class WixiTaxRate
{
    public int Id { get; set; }
    public int TaxCategoryId { get; set; }  // FK → WixiTaxCategory
    public int CountryId { get; set; }      // FK → WixiCountry
    public TaxType Type { get; set; }       // VAT / ExciseTax / DigitalServicesTax
    public decimal Rate { get; set; }       // 0.20 (%20)
    public DateTime ValidFrom { get; set; } // Oranın geçerlilik başlangıcı
    public DateTime? ValidTo { get; set; }  // null = hâlâ geçerli
    public bool IsActive { get; set; } = true;
}

public enum TaxType { VAT, ExciseTax, DigitalServicesTax, SalesTax }
```

**ECommerce etkisi:** `WixiProduct` entity'sine `TaxCategoryId` FK eklenmeli.

---

## 4. Kargo Tanımları (Shipping Reference Data)

### 4.1 WixiShippingCarrier — Kargo Firması

```csharp
public class WixiShippingCarrier
{
    public int Id { get; set; }
    public string Code { get; set; }              // "yurticikargo", "ptt", "aras"
    public string Name { get; set; }              // "Yurtiçi Kargo"
    public string? LogoUrl { get; set; }
    public string? TrackingUrlTemplate { get; set; } // "https://kargotakip.yurticikargo.com/track/{number}"
    public string? ApiEndpoint { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public ICollection<WixiShippingRate> Rates { get; set; }
}
```

### 4.2 WixiShippingZone — Kargo Bölgesi

```csharp
public class WixiShippingZone
{
    public int Id { get; set; }
    public string Name { get; set; }       // "Yurt İçi", "Avrupa", "Dünya"
    public string? CountryCodesJson { get; set; } // ["TR"] veya ["DE","FR","NL"]
    public bool IsActive { get; set; } = true;
}
```

### 4.3 WixiShippingRate — Kargo Ücreti

```csharp
public class WixiShippingRate
{
    public int Id { get; set; }
    public int CarrierId { get; set; }       // FK → WixiShippingCarrier
    public int ZoneId { get; set; }          // FK → WixiShippingZone
    public decimal? MinWeight { get; set; }  // kg
    public decimal? MaxWeight { get; set; }  // kg — null = sınırsız
    public decimal Price { get; set; }
    public string CurrencyCode { get; set; } // FK → WixiCurrency.Code
    public bool IsFreeAbove { get; set; }    // Belirli tutarın üstünde ücretsiz mi?
    public decimal? FreeShippingThreshold { get; set; }
    public bool IsActive { get; set; } = true;
}
```

---

## 5. Ölçü Birimi Tanımları (Unit Reference Data)

### 5.1 WixiUnit — Ölçü Birimi

**Neden gerekli:** `WixiProduct` ve `WixiProductVariant`'ta birim string olarak tutuluyor.  
Ürün ekranında dropdown, stok hareketlerinde tutarlı birim dönüşümü için şart.

```csharp
public class WixiUnit
{
    public int Id { get; set; }
    public string Code { get; set; }         // "adet", "kg", "lt", "m", "m2", "kutu"
    public string Name { get; set; }         // "Adet"
    public string? NameEn { get; set; }      // "Piece"
    public string? Symbol { get; set; }      // "kg", "lt", "m²"
    public UnitType Type { get; set; }       // Quantity, Weight, Volume, Length, Area, Time
    public string? BaseUnitCode { get; set; } // "kg" → BaseUnit "g" gibi (opsiyonel dönüşüm)
    public decimal? ConversionFactor { get; set; } // 1 kg = 1000 g → factor: 1000
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}

public enum UnitType { Quantity, Weight, Volume, Length, Area, Time, Custom }
```

**Seed data önerisi:**

| Code | Name | Symbol | Type |
|------|------|--------|------|
| adet | Adet | adet | Quantity |
| paket | Paket | pkt | Quantity |
| kutu | Kutu | kutu | Quantity |
| kg | Kilogram | kg | Weight |
| gr | Gram | g | Weight |
| ton | Ton | t | Weight |
| lt | Litre | lt | Volume |
| ml | Mililitre | ml | Volume |
| m | Metre | m | Length |
| cm | Santimetre | cm | Length |
| m2 | Metrekare | m² | Area |
| m3 | Metreküp | m³ | Volume |

---

## 6. Finansal Tanımlar (Financial Reference Data)

### 6.1 WixiBank — Banka

**Neden gerekli:** Havale/EFT ödeme yöntemi, e-fatura IBAN doğrulaması,  
tenant banka hesap tanımları.

```csharp
public class WixiBank
{
    public int Id { get; set; }
    public string SwiftCode { get; set; }    // "AKBKTRIS" — BIC/SWIFT
    public string Name { get; set; }         // "Akbank T.A.Ş."
    public string? ShortName { get; set; }   // "Akbank"
    public int CountryId { get; set; }       // FK → WixiCountry
    public string? LogoUrl { get; set; }
    public string? IbanPrefix { get; set; }  // "TR" — IBAN ülke kodu
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}
```

### 6.2 WixiPaymentMethod — Ödeme Yöntemi

**Neden gerekli:** `WixiOrder.PaymentGateway` şu an serbest metin.  
Checkout'ta hangi ödeme yöntemlerinin gösterileceği tenant'ın aktif yöntemlerine bağlı olmalı.

```csharp
public class WixiPaymentMethod
{
    public int Id { get; set; }
    public string Code { get; set; }          // "credit_card", "bank_transfer", "cod", "iyzipay"
    public string Name { get; set; }          // "Kredi Kartı"
    public string? NameEn { get; set; }       // "Credit Card"
    public string? Icon { get; set; }         // "credit-card" (lucide icon adı)
    public PaymentMethodType Type { get; set; } // Online / Offline / BNPL
    public bool RequiresGateway { get; set; }   // Üçüncü taraf API gerektirir mi?
    public string? GatewayProvider { get; set; } // "iyzipay", "stripe", "paypal"
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}

public enum PaymentMethodType { Online, Offline, BNPL, Crypto }
```

**Seed data:**

| Code | Name | Type | Provider |
|------|------|------|---------|
| credit_card | Kredi / Banka Kartı | Online | iyzipay / stripe |
| bank_transfer | Havale / EFT | Offline | — |
| cod | Kapıda Ödeme | Offline | — |
| iyzipay | İyzipay | Online | iyzipay |
| stripe | Stripe | Online | stripe |
| paypal | PayPal | Online | paypal |

---

## 7. Operasyonel Tanımlar

### 7.1 WixiTimeZone — Zaman Dilimi

**Neden gerekli:** Tenant ayarları, randevu modülü, log timestamp'leri için.

```csharp
public class WixiTimeZone
{
    public int Id { get; set; }
    public string Code { get; set; }          // "Europe/Istanbul" — IANA tz name
    public string Name { get; set; }          // "Türkiye (UTC+3)"
    public string? Abbreviation { get; set; } // "TRT"
    public int UtcOffsetMinutes { get; set; } // 180 (+3 saat)
    public bool SupportsDst { get; set; }     // Yaz saati uygulaması
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}
```

### 7.2 WixiNaceCode — Sektör / Faaliyet Kodu

**Neden gerekli:** e-Fatura / e-Arşiv entegrasyonu, tenant şirket profili,  
B2B müşteri segmentasyonu.

```csharp
public class WixiNaceCode
{
    public int Id { get; set; }
    public string Code { get; set; }          // "47.91" — NACE Rev.2
    public string Name { get; set; }          // "İnternet üzerinden yapılan perakende ticaret"
    public string? NameEn { get; set; }       // "Retail sale via Internet"
    public int? ParentId { get; set; }        // Hiyerarşik: Bölüm > Grup > Sınıf
    public NaceLevel Level { get; set; }      // Section (A-U) / Division (2) / Group (3) / Class (4)
    public bool IsActive { get; set; } = true;
}

public enum NaceLevel { Section, Division, Group, Class }
```

---

## 8. Mevcut Entity'lere Etki (Migration Impact)

### 8.1 WixiAddress — Düzeltilmesi Gereken

```csharp
// EKLENECEK ALANLAR (mevcut string alanlar korunur — geriye dönük uyumluluk)
public int? CountryId { get; set; }        // FK → WixiCountry (Core DB'ye cross-DB FK yok!)
public int? ProvinceId { get; set; }       // FK → WixiProvince
public int? DistrictId { get; set; }       // FK → WixiDistrict  
public int? NeighborhoodId { get; set; }   // FK → WixiNeighborhood
public string? CountryCode { get; set; }   // "TR" — display için denormalize
// ZipCode zaten var, PostalCode olarak yeniden adlandırılabilir
```

> **Önemli:** ECommerce per-tenant DB, Core DB'den farklı. FK constraint EF Core'da  
> tanımlanamaz. `CountryId` vs `CountryCode` tercihi: **CountryCode** string tercih edilir,  
> lookup API üzerinden çözümlenir. Alternatif: Core referans tablolar ayrı bir  
> `WixiReferenceDb` üzerinde tutulur, tüm modüller ortak erişir.

### 8.2 WixiTenant — Eklenecek

```csharp
public string? CountryCode { get; set; }     // "TR" — şirket ülkesi
public string? TimezoneCode { get; set; }    // "Europe/Istanbul"
public string? TaxNumber { get; set; }       // VKN / Vergi No
public string? TaxOffice { get; set; }       // Vergi Dairesi
public string? NaceCode { get; set; }        // Sektör kodu
public string? CompanyAddress { get; set; }  // Resmi adres
public string? CompanyType { get; set; }     // "A.Ş.", "Ltd.", "Şahıs"
```

### 8.3 WixiProduct — Eklenecek

```csharp
public int? UnitId { get; set; }           // FK → WixiUnit (Core DB — yine cross-DB sorunu)
public string? UnitCode { get; set; }      // Denormalize: "adet", "kg"
public int? TaxCategoryId { get; set; }    // FK → WixiTaxCategory
public string? TaxCategoryCode { get; set; } // Denormalize: "kdv_20"
```

---

## 9. Mimari Karar: Core DB vs Ayrı Reference DB

### Seçenek A — Referanslar Core DB'de (Önerilen)
- Tüm global tablolar `WixiCoreDbContext`'e eklenir
- ECommerce modülü countryCode/unitCode gibi **denormalize string** saklar
- Lookup için Core API endpoint'leri açılır (`GET /api/v1/ref/countries`, vb.)
- **Avantaj:** Basit, tek DB, mevcut yapıya uygun
- **Dezavantaj:** Cross-module FK yok, veri tutarlılığı uygulama katmanında

### Seçenek B — Ayrı WixiReferenceDb
- Sadece referans tablolar ayrı DB (tenant-agnostic)
- Tüm modüller bu DB'ye erişir
- FK constraint kurulabilir
- **Avantaj:** Gerçek referans bütünlüğü
- **Dezavantaj:** Yeni bağlantı, yeni migration seti, yeni context

**Karar: Seçenek A** — Mevcut modüler monolit yapısıyla uyumlu.  
Core DB referans tabloları tutar, diğer modüller REST API veya shared service üzerinden erişir.

---

## 10. Öncelik ve Faz Planı

### Faz 1 — Sprint 1-2 (ACİL)

| Entity | Neden Öncelikli |
|--------|-----------------|
| `WixiCountry` | Adres formu, checkout, tenant profili |
| `WixiTaxCategory` + `WixiTaxRate` | İyzipay entegrasyonu, sipariş faturası |
| `WixiShippingCarrier` | Sipariş kargo takibi |
| `WixiPaymentMethod` | Checkout ödeme seçenekleri |

### Faz 2 — Sprint 2-3 (GEREKLİ)

| Entity | Neden |
|--------|-------|
| `WixiUnit` | Ürün varyant, stok hareketi |
| `WixiProvince` (TR — 81 il) | Adres dropdown |
| `WixiDistrict` (TR — ~973 ilçe) | Adres dropdown |
| `WixiBank` | Havale/EFT ödeme yöntemi |

### Faz 3 — Sprint 3-4 (ÖNEMLİ)

| Entity | Neden |
|--------|-------|
| `WixiNeighborhood` (TR seed) | Otomatik tamamlama, posta kodu |
| `WixiTimeZone` | Multi-ülke tenant desteği |
| `WixiShippingZone` + `WixiShippingRate` | Gelişmiş kargo konfigürasyonu |

### Faz 4 — Sprint 4-5 (İLERİDE)

| Entity | Neden |
|--------|-------|
| `WixiNaceCode` | e-Fatura entegrasyonu |
| `WixiPostalCode` (ayrı tablo) | Türkiye dışı ülkeler |
| Diğer ülke il/ilçe verileri | Uluslararası genişleme |

---

## 11. Seed Data Stratejisi

### Statik Seed (Migration'da otomatik):
```csharp
// 20260522_AddReferenceData.cs içinde
modelBuilder.Entity<WixiCountry>().HasData(/* ISO 3166-1 listesi */);
modelBuilder.Entity<WixiUnit>().HasData(/* standart birimler */);
modelBuilder.Entity<WixiPaymentMethod>().HasData(/* ödeme yöntemleri */);
modelBuilder.Entity<WixiTaxCategory>().HasData(/* KDV kategorileri */);
modelBuilder.Entity<WixiTaxRate>().HasData(/* Türkiye KDV oranları */);
```

### JSON Import (Admin Panel — Data Seeder servisi):
```csharp
// IDataSeederService
Task SeedProvincesAsync(string countryAlpha2); // TR → 81 il
Task SeedDistrictsAsync(int provinceId);        // İl → ilçeleri
Task SeedNeighborhoodsAsync(int districtId);    // İlçe → mahalleler + PTT kodu
Task SeedPostalCodesFromApiAsync(string alpha2); // Zippopotam / PTT API
```

### Dış API Senkron:
- **PTT API** — Posta kodu, mahalle verileri (Türkiye)
- **GeoNames** — Uluslararası il/ilçe verileri
- **TCMB** — Zaten mevcut (`SyncTcmbRates` command)

---

## 12. Admin Panel Sayfaları (UI Gereksinimleri)

Her referans tablo için `Admin Panel → Tanımlamalar` altında:

```
/admin/definitions/
├── countries        — Ülke Yönetimi (liste + aktif/pasif)
├── provinces        — İl / Eyalet (ülke filtreli dropdown + CRUD)
├── districts        — İlçe (il filtreli + CRUD)
├── neighborhoods    — Mahalle (ilçe filtreli + bulk import)
├── tax-categories   — Vergi Kategorileri
├── tax-rates        — Vergi Oranları (ülke + kategori filtreli)
├── shipping-carriers — Kargo Firmaları
├── shipping-zones   — Kargo Bölgeleri
├── shipping-rates   — Kargo Ücret Tablosu
├── units            — Birim Tanımları
├── banks            — Banka Tanımları
├── payment-methods  — Ödeme Yöntemi Tanımları
└── timezones        — Zaman Dilimleri (sadece aktif/pasif)
```

---

## 13. Özet Tablo

| Entity | Modül | Seed | Aciliyet | Admin UI |
|--------|-------|------|----------|----------|
| WixiCountry | Core | ISO 3166-1 (~250) | 🔴 Faz 1 | Kısıtlı |
| WixiProvince | Core | TR (81), diğer import | 🔴 Faz 2 | CRUD |
| WixiDistrict | Core | TR (~973) import | 🔴 Faz 2 | CRUD |
| WixiNeighborhood | Core | PTT import (~50K) | 🟡 Faz 3 | Bulk |
| WixiPostalCode | Core | API sync | 🟢 Faz 4 | Sadece okuma |
| WixiTaxCategory | Core | Manuel (4 kategori) | 🔴 Faz 1 | CRUD |
| WixiTaxRate | Core | TR oranları | 🔴 Faz 1 | CRUD |
| WixiShippingCarrier | Core/ECom | Manuel (5–6 firma) | 🔴 Faz 1 | CRUD |
| WixiShippingZone | Core/ECom | Manuel | 🟡 Faz 3 | CRUD |
| WixiShippingRate | Core/ECom | Manuel | 🟡 Faz 3 | CRUD |
| WixiUnit | Core | 12 standart birim | 🔴 Faz 2 | CRUD |
| WixiBank | Core | TR bankaları (~50) | 🟡 Faz 2 | CRUD |
| WixiPaymentMethod | Core | 6 yöntem | 🔴 Faz 1 | CRUD |
| WixiTimeZone | Core | IANA list | 🟡 Faz 3 | Aktif/Pasif |
| WixiNaceCode | Core | NACE Rev.2 | 🟢 Faz 4 | Hiyerarşik |
