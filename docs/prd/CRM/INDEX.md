# E-Ticaret CRM — Modül İndeksi

> Bu klasör, CRM sisteminin **modül-modül** analiz ve tasarımını tutar. Tek büyük döküman yerine her iş alanı kendi dosyasında — böylece her modül bağımsız, mevcut `Wixi.Modules.*` mimarisine uygun şekilde tek tek detaylandırılır.
>
> **Akış:** `INDEX.md` (bu dosya, master harita) → `modules/Mxx-*.md` (her modülün analizi) → detaylandırma fazında her stub derin tasarıma dönüşür (entity + CQRS + migration + frontend + API).

## Kaynak Dökümanlar
- [`ETicaret_CRM_Proje_Dokumani.docx`](ETicaret_CRM_Proje_Dokumani.docx) — iş kapsamı, 8 modül öncelik matrisi
- [`Wixi_DB_Tasarim_v4_SifirdanAnaliz.docx`](Wixi_DB_Tasarim_v4_SifirdanAnaliz.docx) — ideal 62 tablo DB tasarımı
- [`gap-analysis.md`](gap-analysis.md) — ideal vs mevcut omurga gap analizi (master karşılaştırma)

---

## Modül Haritası

| Kod | Modül | Durum | Faz | Öncelik | Detay |
|-----|-------|:-----:|:---:|---------|:-----:|
| [M00](modules/M00-referans-master.md) | Referans Veri & Master | ✅ | — | Altyapı | ✔️ |
| [M01](modules/M01-urun-katalog.md) | Ürün & Katalog | ✅ | 0 | — (mevcut) | ✔️ |
| [M02](modules/M02-musteri-crm.md) | **Müşteri & CRM Çekirdeği** | ❌🟡 | 1 | 🔴 Kritik | 🔨 |
| [M03](modules/M03-sadakat.md) | Sadakat & Ödül | 🟡 | 1 | 🟠 Yüksek | 🔨 |
| [M04](modules/M04-cari-b2b.md) | Cari / B2B | 🟡 | 2 | 🟠 Yüksek | 🔨 |
| [M05](modules/M05-destek-ticket.md) | Müşteri Destek (Ticket/SLA) | ❌ | 2 | 🔴 Kritik | 🔨 |
| [M06](modules/M06-siparis-odeme.md) | Sipariş & Ödeme | ✅🟡 | 0 | 🔴 Kritik | 🔨 |
| [M07](modules/M07-stok-depo.md) | Stok & Depo | 🟡 | 0/3 | 🔴 Kritik | 🔨 |
| [M08](modules/M08-kargo-teslimat.md) | Kargo & Teslimat | 🟡 | 3 | 🔴 Kritik | 🔨 |
| [M09](modules/M09-iade-rma.md) | İade & Değişim (RMA) | ❌ | 3 | 🔴 Kritik | 🔨 |
| [M10](modules/M10-tedarikci-satinalma.md) | Tedarikçi & Satın Alma | ❌ | 3 | 🟠 Yüksek | 🔨 |
| [M11](modules/M11-pazarlama-kampanya.md) | Pazarlama & Kampanya | ❌ | 4 | 🟠 Yüksek | 🔨 |
| [M12](modules/M12-finans-fatura.md) | Finans & Fatura | ❌ | 4 | 🔴 Kritik | 🔨 |
| [M13](modules/M13-raporlama-bi.md) | Raporlama & BI | 🟡 | 4 | 🟠 Yüksek | 🔨 |

**Durum:** ✅ Hazır · 🟡 Kısmi · ❌ Eksik &nbsp;|&nbsp; **Detay:** ⏳ Bekliyor · 🔨 Tasarlanıyor · ✔️ Tamam

---

## Faz Sıralaması (uygulama önceliği)

```
Faz 0  (mevcut omurga)   M01 Katalog · M06 Sipariş · M07 Stok  → genişletme
Faz 1  (CRM çekirdeği)   M02 Müşteri/CRM · M03 Sadakat
Faz 2  (ilişki yönetimi) M04 Cari/B2B · M05 Destek
Faz 3  (operasyon)       M08 Kargo · M09 İade · M10 Tedarikçi · M07 Sayım
Faz 4  (büyüme & finans)  M11 Pazarlama · M12 Finans · M13 Raporlama
```

## Bağımlılık Grafiği (özet)

```
M00 Referans ──> (tüm modüller string-kopya referans)
M01 Katalog ───> M06 Sipariş, M07 Stok, M10 Tedarikçi
M02 Müşteri ───> M03 Sadakat, M05 Destek, M11 Pazarlama, M06 Sipariş(B2C)
M04 Cari ──────> M06 Sipariş(B2B), M12 Finans, M05 Destek
M06 Sipariş ───> M08 Kargo, M09 İade, M12 Finans, M03 Sadakat(puan)
M07 Stok ──────> M09 İade(restok), M10 Tedarikçi(mal kabul)
M02+M06 ───────> M13 Raporlama (RFM, cohort, churn)
```

---

## Mimari Kararlar (tüm modülleri etkiler)

> **Tek kaynak: [DECISIONS.md](DECISIONS.md)** — cross-cutting kararlar (D-01..D-07). Modül-içi açık sorular (O-*) → **[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)** (38 soru: 34 ✅ kapatıldı, 4 ⏸️ sağlayıcı/sonraki faz). Yeni modül tasarlarken önce bunlara bak.

**✅ Tüm kararlar verildi (7/7 — açık karar kalmadı):**
- **D-01** Kargo yapısı — Master katalog (`WixiCargoCarrier`) + Per-tenant key (`WixiCargoCarrierSetting`)
- **D-02** Dosya saklama — Harici/tam URL yasak; VARBINARY veya sunucu+`relativePath`; dış linkler (TrackingUrl, WebsiteUrl) istisna
- **D-03** Referans çerçevesi — Master / Per-Tenant / Enum yerleşim kuralı
- **D-04** CRM modül sınırı — `Wixi.Modules.ECommerce` içinde (`Application/Crm/`), ayrı modül değil
- **D-05** Provisioner — mevcut `ECommerceTenantProvisioner` (yeni DbSet otomatik migrate)
- **D-06** Job pattern — `BackgroundService` (mevcut 3 worker örneği)
- **D-07** Cari/Tedarikçi — `CARI_*` / `SUPPLIER_*` ayrı tablolar (WixiContact ayrıştırılır)

---

## Modül Dosya Şablonu

Her `modules/Mxx-*.md` dosyası şu bölümleri içerir (detaylandırma fazında doldurulur):
`Durum & Faz` · `Kapsam` · `İlgili Tablolar (ideal→mevcut)` · `Bağımlılıklar` · `Ana İşlevler` · `Açık Sorular` · `Detay Tasarım TODO` (entity / CQRS / migration / frontend / API).
