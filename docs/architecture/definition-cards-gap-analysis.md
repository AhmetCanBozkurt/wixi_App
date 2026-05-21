# Tanımlama Kartları — Boşluk Analizi (Gap Analysis)

> **Tarih:** 2026-05-21  
> **Kaynak:** Kullanıcının sağladığı ~90 tanımlama kartı listesi  
> **Referans:** `reference-data-analysis.md` (önceki analiz)  
> **Amaç:** Hangi kartlar hangi modülde, ilk analizde ne eksik kaldı?

---

## Önce Büyük Resim

Bu liste basit bir e-ticaret platformunun referans verilerinin çok ötesinde:  
**tam bir freight forwarding (uluslararası nakliye acentesi) yazılımının** tanımlama haritası.

Sistem buna göre **3 katmana** ayrılmalı:

```
┌─────────────────────────────────────────────────┐
│          Wixi.Modules.Core (Ortak Altyapı)      │
│   Ülke, İl, İlçe, Para Birimi, KDV, Banka,    │
│   Kullanıcı, Birim, Belge Şablonu, Log          │
├─────────────────────────────────────────────────┤
│        Wixi.Modules.ECommerce (Mevcut)          │
│   Ürün, Sipariş, Stok, Müşteri, Adres          │
├─────────────────────────────────────────────────┤
│   Wixi.Modules.Logistics (YENİ — Çekirdek)     │
│   Rate Kartlar, Liman, Konteyner, Gemi,         │
│   Uçak, Araç, Acenta, Forwarder, Gümrük,       │
│   IMO/UN, Incoterms, GTIP, Handling             │
└─────────────────────────────────────────────────┘
```

---

## Kart Bazlı Analiz Tablosu (91 Kart)

### Gösterge
- ✅ **VAR** — Mevcut entity veya önceki analizde tam karşılanmış
- ⚠️ **KISMI** — Önceki analizde var ama eksik/genişletilmeli
- ❌ **YOK** — Önceki analizde hiç yok, yeni entity gerekli
- 🔶 **LOJİSTİK** — Yeni `Wixi.Modules.Logistics` modülüne ait

---

### GRUP 1 — Coğrafi Tanımlar

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 1 | Ülke Ekle / Liste | ✅ VAR | `WixiCountry` | Core | Önceki analizde tam |
| 2 | Şehir Ekle / Liste | ⚠️ KISMI | `WixiProvince` | Core | "Şehir" = İl/Province olarak modellenmişti; ayrı `WixiCity` gerekebilir |
| 3 | Bölge Ekle / Liste | ❌ YOK | `WixiRegion` | Core | Kontinent-altı coğrafi bölge (Ege, Marmara, Ortadoğu vb.) — analizde yoktu |
| 4 | İlçe Ekle / Liste | ✅ VAR | `WixiDistrict` | Core | Önceki analizde tam |
| 5 | Eyalet Ekle / Liste | ⚠️ KISMI | `WixiProvince` (Type=State) | Core | ProvinceType enum içinde; ayrı tablo gereksiz |
| 6 | Liman Ekle / Liste | ❌ YOK | `WixiPort` | Logistics | Analizde hiç yoktu — kritik lojistik entity |

---

### GRUP 2 — Finansal Tanımlar

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 7 | Para Birimi Ekle / Liste | ✅ VAR | `WixiCurrency` | Core | Zaten mevcut, tam |
| 8 | KDV Ekle / Liste | ✅ VAR | `WixiTaxRate` | Core | Önceki analizde tam |
| 9 | Banka Ekle / Liste | ✅ VAR | `WixiBank` | Core | Önceki analizde tam |
| 10 | Vade Ekle / Liste | ❌ YOK | `WixiPaymentTerm` | Core | **Analizde yoktu** — B2B ödeme vadesi (Net 30, Net 60, Peşin vb.) |
| 11 | Ödeme Tipi Ekle / Liste | ✅ VAR | `WixiPaymentMethod` | Core | Önceki analizde tam |
| 12 | Vergi Dairesi Ekle / Liste | ❌ YOK | `WixiTaxOffice` | Core | **Analizde yoktu** — e-fatura, cari kart için şart |

---

### GRUP 3 — Ticaret ve Gümrük Tanımları

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 13 | Incoterms Ekle / Liste | ❌ YOK | `WixiIncoterm` | Core/Logistics | **Analizde yoktu** — EXW, FOB, CIF, DDP vb. — statik seed |
| 14 | GTIP Ekle / Liste | ❌ YOK | `WixiHsCode` | Core/Logistics | **Analizde yoktu** — Gümrük Tarife Pozisyonu, hiyerarşik (Bölüm→Fasıl→Pozisyon→Alt Pozisyon) |
| 15 | Sektör Ekle / Liste | ⚠️ KISMI | `WixiNaceCode` | Core | NACE kodları analizde vardı; "Sektör" daha basit flat liste ise ayrı `WixiSector` |
| 16 | Gümrük Ekle / Liste | ❌ YOK | `WixiCustomsOffice` | Logistics | **Analizde yoktu** — Gümrük müdürlüğü/kapısı (İstanbul Havalimanı Gümrüğü vb.) |
| 17 | IMO Kodu Ekle / Liste | 🔶 LOJİSTİK | `WixiImoCode` | Logistics | Tehlikeli madde sınıfları (IMO 1–9) |
| 18 | UN Numarası Ekle / Liste | 🔶 LOJİSTİK | `WixiUnNumber` | Logistics | BM tehlikeli madde numaraları (~3500 kayıt, seed gerekli) |
| 19 | UN Ambalaj Tipi Ekle / Liste | 🔶 LOJİSTİK | `WixiUnPackagingType` | Logistics | X, Y, Z performans grupları |
| 20 | EMS Kodu Ekle / Liste | 🔶 LOJİSTİK | `WixiEmsCode` | Logistics | Emergency Schedule — tehlikeli madde acil prosedürü |
| 21 | Ambalaj Talimatı Ekle / Liste | 🔶 LOJİSTİK | `WixiPackingInstruction` | Logistics | IATA PI kodları (P001–P913) |

---

### GRUP 4 — Taşımacılık Altyapısı

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 22 | Terminal Ekle / Liste | ❌ YOK | `WixiTerminal` | Logistics | **Analizde yoktu** — Liman/havalimanı içindeki terminal |
| 23 | Ambar Ekle (Antrepo) / Liste | ❌ YOK | `WixiBondedWarehouse` | Logistics | ECommerce'deki `WixiWarehouse` farklı; antrepo = gümrüklü depo |
| 24 | Havayolu Antrepo Ekle / Liste | 🔶 LOJİSTİK | `WixiAirWarehouse` | Logistics | Havalimanı antreposuna özel ek alanlar |
| 25 | Denizyolu Antrepo Ekle / Liste | 🔶 LOJİSTİK | `WixiSeaWarehouse` | Logistics | Liman antreposu |
| 26 | Karayolu Antrepo Ekle / Liste | 🔶 LOJİSTİK | `WixiRoadWarehouse` | Logistics | Kara antreposu / TIR parkı |
| 27 | Adres Ekle | ⚠️ KISMI | `WixiAddress` | Core/ECommerce | ECommerce'de var; Core'da genel adres entity'si ayrı gerekebilir |

---

### GRUP 5 — Taşıma Modları ve Operatörler

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 28 | Taşıma Modu Ekle / Liste | ❌ YOK | `WixiTransportMode` | Core/Logistics | **Analizde yoktu** — Hava/Deniz/Kara/Demir/Kurye (enum + tablo) |
| 29 | Taşıma Türü Ekle / Liste | ❌ YOK | `WixiTransportType` | Logistics | FCL/LCL/FTL/LTL/Express vb. |
| 30 | Operasyon Türü Ekle / Liste | ❌ YOK | `WixiOperationType` | Logistics | İthalat/İhracat/Transit/Domestic |
| 31 | Servis Türü Ekle / Liste | ❌ YOK | `WixiServiceType` | Logistics | Door-to-Door, Port-to-Port vb. |
| 32 | Havayolu Ekle / Liste | ❌ YOK | `WixiAirline` | Logistics | **Analizde yoktu** — IATA kodu, ICAO kodu, hub havalimanı |
| 33 | Denizyolu Ekle / Liste | ⚠️ KISMI | `WixiShippingCarrier` (deniz) | Logistics | Önceki analizde `WixiShippingCarrier` genel tutulmuştu; deniz taşıyıcı özel alanlar eklenebilir |
| 34 | Karayolu Ekle / Liste | ⚠️ KISMI | `WixiShippingCarrier` (kara) | Logistics | Aynı şekilde; veya taşıma moduna göre ayrı entity |
| 35 | Demiryolu Ekle / Liste | ❌ YOK | `WixiRailCarrier` | Logistics | **Analizde yoktu** — demiryolu operatörü |
| 36 | Acenta Ekle / Liste | ❌ YOK | `WixiAgent` | Logistics | **Analizde yoktu** — destinasyon acentesi, coloader |
| 37 | Forwarder Ekle / Liste | ❌ YOK | `WixiForwarder` | Logistics | **Analizde yoktu** — uluslararası nakliye acentesi |
| 38 | Network Ağı Ekle / Liste | ❌ YOK | `WixiNetwork` | Logistics | **Analizde yoktu** — acente/forwarder ağı (WCA, FIATA vb.) |

---

### GRUP 6 — Araç / Taşıt Tanımları

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 39 | Araç Tipi Ekle / Liste | ❌ YOK | `WixiVehicleType` | Logistics | Tır, Kamyon, Kamyonet, Frigorifik vb. |
| 40 | Araç Ekle / Liste | ❌ YOK | `WixiVehicle` | Logistics | Plaka, tip, kapasite, belgeler |
| 41 | Uçak Tipi Ekle / Liste | 🔶 LOJİSTİK | `WixiAircraftType` | Logistics | B747F, B777F — IATA tipleri |
| 42 | Uçak Ekle / Liste | 🔶 LOJİSTİK | `WixiAircraft` | Logistics | Kuyruk no, tip, max yük kapasitesi |
| 43 | Gemi Tipi Ekle / Liste | 🔶 LOJİSTİK | `WixiVesselType` | Logistics | Container, Bulk, RoRo, Tanker |
| 44 | Gemi Ekle / Liste | 🔶 LOJİSTİK | `WixiVessel` | Logistics | IMO numarası, bayrak, DWT, TEU kapasitesi |
| 45 | Konteyner Ekle / Liste | ❌ YOK | `WixiContainer` | Logistics | **Analizde yoktu** — 20DC, 40DC, 40HC, 20RF, 40RF vb. |

---

### GRUP 7 — Yük / Kargo Tanımları

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 46 | Yük Türü Ekle / Liste | ❌ YOK | `WixiCargoType` | Logistics | Genel yük, Tehlikeli, Soğuk Zincir, Proje, Ağır Yük |
| 47 | Paket Türü Ekle / Liste | ❌ YOK | `WixiPackageType` | Core/Logistics | **Analizde yoktu** — Palet, Koli, Varil, Çuval, Ahşap Sandık |
| 48 | Refeer Seviyesi Ekle / Liste | 🔶 LOJİSTİK | `WixiReeferLevel` | Logistics | Soğutma sıcaklık seviyeleri (+2/+8, -18, -25 vb.) |
| 49 | Ürün Tanımı Ekle / Liste | ❌ YOK | `WixiProductDescription` | Core/Logistics | **Analizde yoktu** — Gümrük ürün tanımı (WixiProduct'tan farklı) |
| 50 | Birim Kategorisi Ekle / Liste | ❌ YOK | `WixiUnitCategory` | Core | **Analizde yoktu** — Ağırlık/Hacim/Uzunluk gibi üst kategori |
| 51 | Birim Ekle / Liste | ✅ VAR | `WixiUnit` | Core | Önceki analizde tam |
| 52 | Birim Tanım Ekle / Liste | ❌ YOK | `WixiUnitConversion` | Core | **Analizde yoktu** — Birimler arası dönüşüm tablosu (1 ton = 1000 kg) |

---

### GRUP 8 — Rate Kart (Fiyatlandırma)

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 53 | Kara Rate Kart Tanımlama / Liste | 🔶 LOJİSTİK | `WixiRoadRateCard` | Logistics | Rota bazlı kara nakliye fiyat kartı |
| 54 | Deniz Rate Kart Tanımlama / Liste | 🔶 LOJİSTİK | `WixiSeaRateCard` | Logistics | Pol-Pod bazlı deniz fiyat kartı (spot + contract) |
| 55 | Hava Rate Kart Tanımlama / Liste | 🔶 LOJİSTİK | `WixiAirRateCard` | Logistics | Havayolu fiyat kartı (chargeable weight bazlı) |
| 56 | Kurye Rate Kart Tanımlama / Liste | 🔶 LOJİSTİK | `WixiCourierRateCard` | Logistics | Kurye/express fiyat kartı |
| 57 | Posta Koduna Göre Fiyat Ekle / Liste | ⚠️ KISMI | `WixiShippingRate` | Logistics | Önceki analizde `WixiShippingRate` vardı; posta kodu filtresi eklenmeli |
| 58 | Havayolu İlave Ücret Ekle / Liste | 🔶 LOJİSTİK | `WixiAirlineSurcharge` | Logistics | FSC, SSC, AWB fee, Security surcharge vb. |

---

### GRUP 9 — Hizmet Tanımları

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 59 | Hizmet Kategori Ekle / Liste | ❌ YOK | `WixiServiceCategory` | Core/Logistics | **Analizde yoktu** — Nakliye, Gümrükleme, Sigorta, Depolama |
| 60 | Hizmet Ekle / Liste | ❌ YOK | `WixiService` | Core/Logistics | **Analizde yoktu** — Faturalabilir hizmet tanımı |
| 61 | Handling Kategori Ekle / Liste | 🔶 LOJİSTİK | `WixiHandlingCategory` | Logistics | Yük elleçleme kategorisi |
| 62 | Handling Kodu Ekle / Liste | 🔶 LOJİSTİK | `WixiHandlingCode` | Logistics | IATA özel yük kodları (AVI, HUM, VAL, OHG vb.) |

---

### GRUP 10 — CRM / Cari Tanımları

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 63 | Cari Ekle / Liste | ❌ YOK | `WixiAccount` | Core/CRM | **Analizde yoktu** — Müşteri/tedarikçi/acenta cari kartı (ECommerce WixiCustomer'dan farklı) |
| 64 | Cari Tipi Ekle / Liste | ❌ YOK | `WixiAccountType` | Core | **Analizde yoktu** — Müşteri, Tedarikçi, Acenta, Gümrük, Banka |
| 65 | Cari Kaynağı Ekle / Liste | ❌ YOK | `WixiAccountSource` | Core | **Analizde yoktu** — Referans, Fuar, Soğuk Arama, Website |
| 66 | Cari Risk Sınıfı Ekle / Liste | ❌ YOK | `WixiAccountRiskClass` | Core | **Analizde yoktu** — Düşük/Orta/Yüksek risk sınıfı |
| 67 | Cari Yetkili Ekle / Liste | ❌ YOK | `WixiAccountContact` | Core | **Analizde yoktu** — Cari kartın yetkili kişileri |
| 68 | Cari Konteyner Ekle / Liste | 🔶 LOJİSTİK | `WixiAccountContainer` | Logistics | Müşteriye atanmış/kiralanmış konteyner |

---

### GRUP 11 — Organizasyon Tanımları

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 69 | Departman Ekle / Liste | ❌ YOK | `WixiDepartment` | Core | **Analizde yoktu** — Operasyon, Satış, Muhasebe, IT |
| 70 | Şube Ekle / Liste | ❌ YOK | `WixiBranch` | Core | **Analizde yoktu** — Şirket şubesi/ofisi |
| 71 | Yetkilendirme Ekle / Liste | ⚠️ KISMI | `WixiRole` | Core | Mevcut rol sistemi var; detaylı yetki matris gerekiyorsa genişletme |

---

### GRUP 12 — İnsan Kaynakları / Kullanıcı

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 72 | Kullanıcı Ekle / Liste | ✅ VAR | `WixiUser` | Core | Zaten mevcut, tam |
| 73 | Unvan Ekle / Liste | ❌ YOK | `WixiJobTitle` | Core | **Analizde yoktu** — Müdür, Uzman, Operasyon Sorumlusu |
| 74 | Yetki Seviyesi Ekle / Liste | ❌ YOK | `WixiAuthorizationLevel` | Core | **Analizde yoktu** — Görüntüleyici/Editör/Onaylayıcı/Yönetici |

---

### GRUP 13 — Destek Talebi

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 75 | Destek Talebi Ekle / Liste | ❌ YOK | `WixiSupportTicket` | Core | **Analizde yoktu** — helpdesk ticket sistemi |
| 76 | Talep Kategori Ekle / Liste | ❌ YOK | `WixiTicketCategory` | Core | **Analizde yoktu** — Teknik/Fatura/Operasyon |
| 77 | Talep Modül Ekle / Liste | ❌ YOK | `WixiTicketModule` | Core | **Analizde yoktu** — hangi Wixi modülüyle ilgili |

---

### GRUP 14 — Dokümantasyon ve Log

| # | Kart Adı | Durum | Entity | Modül | Not |
|---|----------|-------|--------|-------|-----|
| 78 | Belge Şablonu Ekle / Liste | ❌ YOK | `WixiDocumentTemplate` | Core/Logistics | **Analizde yoktu** — `WixiMailTemplate`'den farklı; PDF/Word doküman (CMR, AWB, B/L şablonları) |
| 79 | Log Kayıt Ekranı | ✅ VAR | `WixiAuditLog` | Core | Zaten mevcut, UI sayfası yapılacak |

---

## Özet: İlk Analizde Ne Eksik Kaldı?

### Core Modülde Gözden Kaçan Entityler (13 adet)

| Entity | Açıklama |
|--------|----------|
| `WixiRegion` | Coğrafi bölge (Marmara, Ege, Ortadoğu vb.) |
| `WixiPort` | Liman — POL/POD için kritik |
| `WixiPaymentTerm` | Vade (Net 30, Net 60, Peşin, 45 Gün) |
| `WixiTaxOffice` | Vergi dairesi (e-fatura zorunluluğu) |
| `WixiIncoterm` | EXW/FOB/CIF/DDP vb. — statik 11 kayıt |
| `WixiHsCode` | GTIP (Gümrük Tarife Pozisyonu) — hiyerarşik |
| `WixiTransportMode` | Hava/Deniz/Kara/Demir/Kurye modu |
| `WixiPackageType` | Palet, Koli, Varil, Çuval |
| `WixiUnitCategory` | Birim üst kategorisi |
| `WixiUnitConversion` | Birimler arası dönüşüm |
| `WixiServiceCategory` | Hizmet kategorisi |
| `WixiService` | Faturalabilir hizmet tanımı |
| `WixiAccountType` | Cari tipi (Müşteri/Tedarikçi/Acenta) |
| `WixiAccountSource` | Cari kaynağı |
| `WixiAccountRiskClass` | Cari risk sınıfı |
| `WixiDepartment` | Departman |
| `WixiBranch` | Şube / Ofis |
| `WixiJobTitle` | Unvan |
| `WixiAuthorizationLevel` | Yetki seviyesi |
| `WixiDocumentTemplate` | PDF/Word belge şablonu |
| `WixiSupportTicket` | Destek talebi |
| `WixiTicketCategory` | Talep kategorisi |
| `WixiTicketModule` | Talep modülü |
| `WixiProductDescription` | Gümrük ürün tanımı |

### Yeni Logistics Modülüne Ait Entityler (~35 adet)

```
Coğrafi/Altyapı:
  WixiPort, WixiTerminal, WixiBondedWarehouse
  WixiAirWarehouse, WixiSeaWarehouse, WixiRoadWarehouse
  WixiCustomsOffice

Taşıyıcılar:
  WixiAirline, WixiShippingLine, WixiRoadCarrier
  WixiRailCarrier, WixiAgent, WixiForwarder, WixiNetwork

Araçlar:
  WixiVehicleType, WixiVehicle
  WixiAircraftType, WixiAircraft
  WixiVesselType, WixiVessel
  WixiContainer

Yük/Kargo:
  WixiCargoType, WixiReeferLevel
  WixiImoCode, WixiUnNumber, WixiUnPackagingType
  WixiEmsCode, WixiPackingInstruction
  WixiHandlingCategory, WixiHandlingCode

Fiyatlandırma:
  WixiRoadRateCard, WixiSeaRateCard
  WixiAirRateCard, WixiCourierRateCard
  WixiAirlineSurcharge

Operasyon:
  WixiTransportType, WixiOperationType, WixiServiceType
  WixiAccountContainer

CRM (Lojistik):
  WixiAccount (Cari), WixiAccountContact
```

---

## Modül Dağılımı Özeti

```
Wixi.Modules.Core   →  +24 yeni entity  (Geographic, Financial, Org, HR, Support)
Wixi.Modules.Logistics  →  ~35 yeni entity  (Rate cards, Vessels, Carriers, Cargo)
Wixi.Modules.ECommerce  →  Mevcut haliyle devam (WixiAddress güncelleme)
```

---

## Öncelik Matrisi (Lojistik Modülü Açısından)

### Faz L1 — Temel Altyapı (Önce bunlar olmadan rate kart girilemez)
1. `WixiTransportMode` — Hava/Deniz/Kara/Demir
2. `WixiPort` — Liman (IATA/UNLOCODE ile seed)
3. `WixiIncoterm` — 11 standart kural (statik seed)
4. `WixiCargoType` — Genel/Tehlikeli/Soğuk Zincir
5. `WixiContainer` — 20DC, 40DC, 40HC, 20RF, 40RF, 45HC
6. `WixiPaymentTerm` — Net 30/60/90, Peşin, Vesaik
7. `WixiPackageType` — Palet, Koli, Varil, Çuval

### Faz L2 — Taşıyıcı ve Araç Tanımları
8. `WixiAirline` (IATA kodu ile)
9. `WixiShippingLine` / `WixiVesselType` / `WixiVessel`
10. `WixiVehicleType` / `WixiVehicle`
11. `WixiAgent` + `WixiForwarder`
12. `WixiCustomsOffice`

### Faz L3 — Rate Kartlar
13. `WixiSeaRateCard` (en çok kullanılan)
14. `WixiAirRateCard`
15. `WixiRoadRateCard`
16. `WixiAirlineSurcharge`
17. `WixiCourierRateCard`

### Faz L4 — Tehlikeli Madde ve Özel Yük
18. `WixiImoCode` + `WixiUnNumber`
19. `WixiHandlingCode` (IATA SHC)
20. `WixiEmsCode` + `WixiPackingInstruction`
21. `WixiReeferLevel`

### Faz L5 — CRM ve Dokümantasyon
22. `WixiAccount` (Cari)
23. `WixiAccountContact` / `WixiAccountType`
24. `WixiDocumentTemplate` (AWB, CMR, B/L şablonları)
25. `WixiHsCode` (GTIP)

---

## Seed Data Kaynakları

| Entity | Veri Kaynağı | Kayıt Sayısı |
|--------|-------------|-------------|
| `WixiIncoterm` | ICC Incoterms® 2020 | 11 |
| `WixiPort` | UN/LOCODE veritabanı | ~100K (Türkiye: ~50) |
| `WixiContainer` | ISO 668 standartları | ~20 |
| `WixiAirline` | IATA airline coding | ~1000+ (aktif) |
| `WixiImoCode` | IMO sınıfları | 9 ana sınıf |
| `WixiUnNumber` | UN Dangerous Goods listesi | ~3500 |
| `WixiHandlingCode` | IATA SHC | ~80 |
| `WixiHsCode` | WCO HS Nomenclature | ~5000 (4 haneli) |
| `WixiTransportMode` | Manuel | 5 |
| `WixiPackageType` | Manuel | ~15 |
