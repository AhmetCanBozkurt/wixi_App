# CRM — Açık Sorular Register (Kapatma)

> Modül analizlerinde çıkan tüm `O-*` açık soruların toplu çözümü (2026-06-14).
> **✅ Kapatıldı** = karar verildi (öneri kabul veya kullanıcı kararı). **⏸️ Ertelendi** = sağlayıcı/iş kararı, ilgili modül implementasyonunda netleşir.
> Tek kaynak: bu dosya + [DECISIONS.md](DECISIONS.md) (cross-cutting D-*).

## Özet
**38 soru:** 34 ✅ kapatıldı · 4 ⏸️ ertelendi (sağlayıcı/sonraki faz).

---

## M02 — Müşteri & CRM
| # | Soru | ✅ Karar |
|---|---|---|
| O-C1 | RFM segment eşikleri sabit mi config mi | **Sabit** (kod sabiti) başla; ihtiyaç olursa per-tenant `WixiRfmRuleSet` |
| O-C2 | Churn ML mi kural mı | **Kural-bazlı** (AtRisk+Sleeping = risk); ML ertelendi |
| O-C3 | `WixiCustomer` genişlet mi ayrı tablo mu | **Genişlet** (FK basitliği, misafirde null) |

## M03 — Sadakat
| # | Soru | ✅ Karar |
|---|---|---|
| O-L1 | Kademe: ayrı tablo mu JSON mu | **Ayrı `WixiLoyaltyTier` tablo** |
| O-L2 | Bakiye: denormalize mi anlık mı | **Denormalize `WixiCustomerPoints`** (hız) |
| O-L3 | Kademe penceresi | **⭐ Ömür boyu kümülatif** (kullanıcı kararı) — toplam ömür boyu kazanım; sıfırlama yok, kademe kaybedilmez. `WixiCustomerPoints.PointsThisYear` → `TotalEarned` baz alınır (kademe için yıllık alan gereksiz) |
| O-L4 | Puan indirimi sipariş satırına mı toplama mı | **⭐ Toplam indirim** (kullanıcı kararı) — tek indirim satırı (kupon gibi); fatura/iade hesabı net, kalem bazlı dağıtım yok |

> **O-L3 etkisi:** M03 `WixiLoyaltyTier.MinPoints` = ömür boyu eşik. `WixiCustomerPoints.PointsThisYear` alanı **kaldırılabilir** (kümülatif `TotalEarned` kullanılır). Kademe düşmez.
> **O-L4 etkisi:** Puan harcama → M06 `WixiOrder.LoyaltyDiscount` (tek toplam alan, zaten tasarımda var). Kalem bazlı dağıtım yok.

## M04 — Cari / B2B
| # | Soru | ✅ Karar |
|---|---|---|
| O-CA1 | `Both` tipi migration | **İki ayrı kayıt** (Cari + Supplier bağımsız), ortak `TaxNumber` ile eşle |
| O-CA2 | Kredi limiti aşımı blok mu uyarı mı | **Store-admin ayarı** (varsayılan uyarı) |

## M05 — Destek
| # | Soru | ✅ Karar |
|---|---|---|
| O-D1 | Omnichannel hangi faz | **E-posta + temel ticket önce**; chat/WhatsApp sonraki aşama |
| O-D2 | SLA süreleri sabit mi config mi | **Per-tenant ayar** (öncelik bazlı değer) |
| O-D3 | Bilgi tabanı M05'te mi | Mevcut **`WixiFaqItem` entegre** |

## M06 — Sipariş & Ödeme
| # | Soru | ✅ Karar |
|---|---|---|
| O-O1 | Sepet başlığı `WixiCart` | **Evet, ekle** (terk sepet/kupon-sakla/expire) |
| O-O2 | Durum geçişleri state machine | **Evet, kurallı** (geçiş doğrulama) |
| O-O3 | Adres snapshot migration | **Mevcut string'leri koru** (legacy alan); yeni siparişler yapısal alanlara yazar, eski parse edilmez |

## M07 — Stok & Depo
| # | Soru | ✅ Karar |
|---|---|---|
| O-S1 | Tek stok kaynağı | **`WixiStock`** tek kaynak; `WixiProductVariant.StockQuantity` → cache/computed (ilk iş) |
| O-S2 | FIFO/LIFO/FEFO | **UnitCost ile FIFO altyapısı**; değerleme raporu M13 |
| O-S3 | Varyantsız ürün stoğu | **Her ürünün default varyantı** (stok varyant bazlı kalır) |

## M08 — Kargo
| # | Soru | ✅ Karar |
|---|---|---|
| O-K1 | İlk firma implementasyonu | **Yurtıçi + Aras** (adaptör var, stub doldur) |
| O-K2 | Etiket PDF | **Firma API'sinden** (`CreateShipmentAsync`) |
| O-K3 | Firma seçimi oto mu manuel mi | **İkisi** (varsayılan oto, override mümkün) |

## M09 — İade / RMA
| # | Soru | ✅ Karar |
|---|---|---|
| O-R1 | Otomatik onay kuralı | **Basit config** (gün limiti + neden + condition) |
| O-R2 | İade kargo entegrasyonu | **M08 olgunlaşınca** otomatik iade etiketi |
| O-R3 | İade fotoğrafı saklama | **Başlangıç JSON** (`ImagePaths`, D-02); çok olursa ayrı tablo |

## M10 — Tedarikçi & Satın Alma
| # | Soru | ✅ Karar |
|---|---|---|
| O-T1 | `Both` migration | **M04 O-CA1 ile aynı** (iki kayıt, koordineli) |
| O-T2 | PO onay kademeli mi | **Tek onay** başla; tutar eşikli çok kademe sonra |
| O-T3 | PO gönderim yöntemi | **PDF + mail** önce; tedarikçi portalı sonra |

## M11 — Pazarlama
| # | Soru | Karar |
|---|---|---|
| O-M1 | SMS/WhatsApp/Push sağlayıcı | ⏸️ **Ertelendi** — e-posta önce (altyapı hazır); SMS vendor (Netgsm/İletiMerkezi) M11 implementasyonunda seçilir |
| O-M2 | Tracking pixel/redirect mi harici mi | ✅ **Kendi pixel/redirect** (veri sahipliği) |
| O-M3 | Terk sepet `WixiCart` bağı | ✅ **M06 O-O1 ile çözüldü** (WixiCart eklenecek) |
| O-M4 | Kupon-kampanya bağı | ✅ Kampanya **alıcıya özel kupon** üretir (`WixiCoupon`) |

## M12 — Finans & Fatura
| # | Soru | Karar |
|---|---|---|
| O-F1 | GİB entegratör sağlayıcısı | ⏸️ **Ertelendi (iş kararı)** — `IGibProvider` adaptör arkasında; sağlayıcı (Logo/Foriba/Uyumsoft) M12 öncesi iş kararı |
| O-F2 | ERP entegrasyonu (Logo/Netsis/SAP) | ⏸️ **Ertelendi** — çekirdek fatura sonrası ayrı çalışma |
| O-F3 | Kâr marjı raporu nerede | ✅ **M13** (veri M06 CostPrice) |
| O-F4 | `WixiInvoiceItem` ayrı tablo | ✅ **Hayır** — `WixiOrderItem` snapshot yeterli (ihtiyaç olursa eklenir) |

## M13 — Raporlama & BI
| # | Soru | Karar |
|---|---|---|
| O-B1 | Anlık query mi snapshot mı | ✅ **Hibrit** (operasyonel anlık, cohort/churn gece snapshot) |
| O-B2 | Churn ML mi kural mı | ✅ **Kural-bazlı** (M02 O-C2) |
| O-B3 | Drag-drop rapor oluşturucu | ✅ **Sabit katalog önce**, özelleştirme sonra |
| O-B4 | Harici BI (PowerBI) | ⏸️ **Ertelendi** — dahili + Excel/CSV önce |

---

## ⏸️ Ertelenen 4 Karar (implementasyonda netleşir)
| # | Konu | Ne zaman |
|---|---|---|
| O-M1 | SMS/WhatsApp sağlayıcı | M11 implementasyonu |
| O-F1 | GİB entegratör sağlayıcısı | M12 öncesi iş kararı |
| O-F2 | ERP entegrasyonu | Çekirdek fatura sonrası |
| O-B4 | Harici BI entegrasyonu | Dahili raporlama sonrası |

Bunlar **tasarımı bloklamıyor** — hepsi adaptör/soyutlama arkasında (`IGibProvider`, mail/SMS provider deseni), sağlayıcı sonradan takılır.
