# 🔍 WIXI Platform — İş Modülleri & Tedarik Zinciri Boşluk Analizi

> **Tarih:** 2026-05-16  
> **Konu:** E-Ticaret, Cari (Tedarikçi/B2B), Depo ve Stok Entegrasyonu  
> **Durum:** Güncellenmiş Mimari Analiz

---

## 1. MİMARİ AYRIM: MÜŞTERİ VS. CARİ (TEDARİKCİ)

Sistemin "dört dörtlük" olması için aşağıdaki iki yapının birbirinden bağımsız ancak entegre çalışması gerekir:

### A. E-Ticaret Son Kullanıcısı (`WixiCustomer`)
- **Kimdir?** Siteden kredi kartıyla alışveriş yapan perakende müşteri.
- **Takibi:** Sipariş geçmişi ve teslimat adresleri bazlıdır. Bakiye takibi (Borç/Alacak) genellikle gerekmez.

### B. Cari Hesaplar (`WixiContact / Cari`)
- **Tedarikçiler:** Şirketin mal satın aldığı, stok girişlerinin kaynağı olan ve finansal borç takibi yapılan firmalar.
- **B2B / Bayiler:** Toptan alım yapan, vadeli çalışan veya özel iskonto tanımlanan kurumsal müşteriler.
- **Takibi:** Finansal bakiye (Ledger), fatura eşleşmeleri ve tedarik zinciri bazlıdır.

---

## 2. DEPO & STOK YÖNETİMİ (Supply Chain)

Depo yönetimi, sistemin omurgasını oluşturmalıdır. Mevcut durumdaki "ürün miktarı" mantığından "depo bazlı stok" mantığına geçiş şarttır.

### 🏬 Depo Tanımı ve Hiyerarşisi
- **Fiziksel Depolar:** Ana Depo, Şube Deposu vb.
- **Sanal Depolar:** İade Deposu, Bozuk/Karantina Deposu.
- **Raf/Konum:** Ürünün deponun neresinde (A-1-3) olduğunun takibi.

### 🔄 Stok Hareket Tipleri (Movement Types)
Her stok hareketinin bir tipi ve kodu olmalıdır:
| Kod | Adı | Açıklama |
| :--- | :--- | :--- |
| **GRN** | Tedarikçi Alım | Depoya ilk stok girişi (Satın Alma) |
| **RTN_SUP** | Tedarikçiye İade | Depodan tedarikçiye geri gönderim |
| **SALE** | Satış Çıkışı | Sipariş sevkiyatı (Depodan çıkış) |
| **RTN_CUS** | Müşteri İadesi | Müşteriden gelen iadenin deponun iade alanına girişi |
| **TRF_OUT** | Depo Transfer Çıkışı | A deposundan ürünün çıkması |
| **TRF_IN** | Depo Transfer Girişi | B deposuna ürünün kabul edilmesi |
| **ADJ** | Sayım Düzeltme | Stok sayımındaki eksik/fazla manuel düzeltmesi |

---

## 3. LOJİSTİK VE KARGO YÖNETİMİ

E-ticaret operasyonunun son halkası olan kargo süreci için şu altyapı şarttır:

### 🚛 A. Kargo Entegrasyonu & API
- **Kargo Firmaları:** Aras, Yurtiçi, MNG, Trendyol Express gibi firmaların API bağlantıları.
- **Barkod & Etiket:** Sipariş onaylandığında kargo firmasının beklediği formatta otomatik etiket/barkod üretimi.
- **Takip Numarası:** Kargo firmasından gelen takip numarasının otomatik olarak müşteriye iletilmesi.

### 📦 B. Dağıtım ve Sipariş Durumları
Siparişin yaşam döngüsü şu statülerle takip edilmelidir:
1.  **Hazırlanıyor:** Sipariş onaylandı, depoda toplanıyor.
2.  **Kargoya Verildi:** Paketleme bitti, kargo firmasına teslim edildi.
3.  **Dağıtımda:** Kargo varış şubesinden alıcıya doğru yola çıktı.
4.  **Teslim Edildi:** Ürün müşteriye ulaştı (Finansal kapanış).

---

## 3. KRİTİK EKSİKLER VE TEKNİK ŞEMA

### 🛠️ Backend (Gerekli Yeni Yapılar)
- `WixiCari`: (Id, Title, Code, Type [Tedarikçi/Müşteri/Bayi], TaxInfo).
- `WixiWarehouse`: (Id, Name, Location).
- `WixiStockEntry`: Stok giriş/çıkış fişleri (Tedarikçi bağlantılı).
- `WixiCariLedger`: Cari hesap ekstresi (Borç/Alacak hareketleri).

### 🎨 Frontend (Gerekli Yeni Sayfalar)
- **Cari Yönetimi (Genişletilmiş):** Tedarikçi ve bayilerin finansal durumlarının izlendiği ekranlar.
- **Stok Giriş Ekranı:** Barkod okutarak veya elle depo bazlı stok artırma.
- **Depo Bazlı Ürün Raporu:** Hangi üründen hangi depoda kaç adet var?

---

## 6. STOREFRONT UI/UX ANALİZİ (Müşteri Deneyimi)

Mevcut müşteri tarafı (Storefront) tasarımında "profesyonel bir pazar yeri" deneyimi için şu iyileştirmeler şarttır:

### 🧭 A. Navbar & Header Revizyonu
- **Menü Çoklaması (Bug):** Navbar üzerinde "Ana Sayfa" linkinin mükerrer görünmesi sorunu giderilmeli. (Backend'den gelen kategori listesi ile sabit linklerin çakışması kontrol edilmeli).
- **Mod Değiştirici (Dark/Light):** Kullanıcıların gece ve gündüz modu arasında geçiş yapabileceği, temanın renklerini dinamik olarak değiştiren bir switch eklenmeli.
- **Dil Çevirisi (I18n):** Sağ üst köşede dil seçim alanı (TR/EN vb.) bulunmalı. Mevcut backend "Multi-language" altyapısı storefront tarafına da bağlanmalı.

### 🔍 B. Trendyol Tipi Filtreleme (Sidebar)
Ürün listeleme ve kategori sayfalarında, ekranın sol tarafında kullanıcıyı karşılayacak zengin bir filtreleme alanı (Trendyol tarzı) oluşturulmalı:
- **Hiyerarşik Kategori Ağacı:** Mevcut kategorinin alt kırılımları.
- **Marka Filtreleri:** Checkbox listesi ve marka içi arama kutusu.
- **Fiyat Aralığı:** Minimum ve maksimum fiyat girişi + Slider.
- **Özellik Filtreleri:** Renk, Beden, Malzeme gibi ürüne özel dinamik filtreler.
- **Sıralama:** Akıllı sıralama (Önerilen, En Düşük Fiyat, En Yüksek Fiyat, En Yeniler).

---

## 8. ÜRÜN TANIMLAMA & VARYANT YÖNETİMİ

Ürün kartlarının Trendyol standartlarında "dört dörtlük" olması için şu teknik detayların eklenmesi şarttır:

### 👕 A. Dinamik Nitelikler (Attributes)
Ürünlerin sadece adı değil, filtrelenebilir nitelikleri (Attribute) ayrı bir yapıda tutulmalıdır:
- **Beden / Numara:** (S, M, L, XL veya 38, 39, 40).
- **Boyut / Ölçü:** (100x200cm, 50ml, 1.5 Litre).
- **Renk:** (Hex kodlu renk seçimi).
- **Materyal:** (Pamuk, Deri, Çelik vb.).

### 💰 B. Gelişmiş Fiyatlandırma ve Vergi
- **Alış Fiyatı (Cost Price):** Kâr marjı analizi için.
- **KDV Oranı:** (%1, %10, %20) bazlı otomatik hesaplama.
- **İndirim Yönetimi:** "Liste Fiyatı" ve "Satış Fiyatı" arasındaki yüzde farkın otomatik gösterimi.

### 📦 C. Varyant & Depo Entegrasyonu (Kritik)
Mevcut yapıdaki `StockQuantity` alanı `WixiProductVariant`'tan kaldırılmalı ve şu yapıya geçilmelidir:
- **Pivot Tablo:** `WixiStock (VariantId, WarehouseId, Quantity)`.
- *Örnek:* "iPhone 15 Pro - Siyah - 256GB" varyantından "Ana Depo"da 10 adet, "Kadıköy Şubesi"nde 2 adet var.

---

## 9. ÖNCELİKLİ ADIMLAR VE DÜZELTMELER
1.  **Navbar & UI Fix:** Menüdeki mükerrer linklerin kaldırılması, I18n/Theme butonlarının eklenmesi.
2.  **Trendyol Tipi Sidebar:** Ürün listeleme sayfasına dinamik niteliklere (Beden, Boyut) göre filtreleme yapabilen sol panelin eklenmesi.
3.  **Depo & Varyant Mimarisi:** Backend'de stoğu varyanttan koparıp depo bazlı hale getirecek migration'ların hazırlanması.

---

## 12. 🐛 THEME DÜZELTME NOTLARI (Mevcut Storefront Hataları)

Bu bölüm, mevcut storefront temasında tespit edilen spesifik bug ve eksikleri kapsar.

### 🧭 A. Navbar Düzeltmeleri

| # | Hata / Eksik | Açıklama | Öncelik |
|---|---|---|---|
| N-1 | **Ana Sayfa Mükerrer Link** | Sabit "Ana Sayfa" nav öğesi ile backend'den gelen kategori/menü listesindeki "Anasayfa" linkinin çakışması; ikisi aynı anda görünüyor. Sabit nav'da tutulup backend'den gelen versiyonu filtrelenmeli. | 🔴 Kritik |
| N-2 | **Dark / Light Mode Switch Yok** | Navbar sağ bölümünde tema değiştiricisi (güneş/ay ikonu) bulunmuyor. `ThemeProvider`'a `toggle()` bağlanmalı, localStorage'a kaydedilmeli. | 🟡 Orta |
| N-3 | **Dil Seçici Yok** | Sağ üst köşede TR/EN geçişi yoktur. Backend'deki `WixiLanguage` tablosundaki aktif diller `Accept-Language` header'ı ile eşleştirilmeli; seçim `localStorage.lng` üzerine yazılmalı. | 🟡 Orta |
| N-4 | **Mobil Hamburger Menü Kapatma** | Mobil görünümde nav açıldıktan sonra dışarıya tıklayınca kapanmıyor; yalnızca buton ile kapanabiliyor. | 🟠 Düşük |
| N-5 | **Sepet İkon Sayacı** | Navbar'daki sepet ikonu, ürün sayısını gerçek zamanlı göstermiyor. Zustand store'daki `cartCount` state'i ikona bağlanmalı. | 🟡 Orta |

### 🔍 B. Filtre / Sidebar Düzeltmeleri

| # | Hata / Eksik | Açıklama | Öncelik |
|---|---|---|---|
| F-1 | **Sidebar Hiç Yok** | Ürün listeleme (`/shop`, `/category/:slug`) sayfalarında sol taraf filtre paneli bulunmuyor. Trendyol benzeri sidebar bileşeni sıfırdan yazılmalı. | 🔴 Kritik |
| F-2 | **URL Tabanlı Filtre State** | Filtreler `useState` yerine URL query params (`?brand=X&minPrice=100`) ile yönetilmeli; böylece filtreli linkler paylaşılabilir ve `useSearchParams` hook'u kullanılabilir. | 🔴 Kritik |
| F-3 | **Fiyat Slider Yok** | Min–Max fiyat aralığı için range slider bileşeni yoktur. React-aria veya custom CSS Slider kullanılabilir; debounce (400ms) ile API'ye gönderilmeli. | 🟡 Orta |
| F-4 | **Marka Checkbox Listesi Yok** | Marka filtrelemesi için `GET /store-admin/brands` verisi checkbox listesine dönüştürülmeli. İçinde marka arama kutusu olmalı. | 🟡 Orta |
| F-5 | **Sıralama (Sort) Parametresi** | Ürün listesi API'si `?sortBy=price_asc|price_desc|newest|recommended` parametresini desteklemiyor. Backend query handler'ına eklenmeli. | 🟡 Orta |
| F-6 | **Aktif Filtre Etiketleri** | Uygulanan filtreler header'da "chip" olarak gösterilmeli; her chip'in yanında "×" ile filtre kaldırılabilmeli. | 🟠 Düşük |
| F-7 | **Mobil Filtre Drawer** | Mobil görünümde sidebar drawer (alttan açılan sheet) olmalı. Desktop'ta statik sol kolon, mobil'de "Filtrele" butonu ile tetiklenen modal. | 🟠 Düşük |

---

## 10. ADRES VE LOKASYON YÖNETİMİ

Kargo ve fatura süreçlerinin hatasız yürümesi için hem Müşteri (`WixiCustomer`) hem de Cari (`WixiCari`) tarafında gelişmiş bir adres defteri altyapısı kurulmalıdır:

### 🏠 A. Çoklu Adres Defteri
- **Adres Tipleri:** Teslimat Adresi ve Fatura Adresi ayrımı.
- **Kurumsal Adres:** Şirket adı, Vergi Dairesi ve Vergi No alanları.
- **Adres Başlığı:** "Evim", "Ofis" gibi kullanıcı tanımlı etiketler.

### 📍 B. Lokasyon Hiyerarşisi
- **İl / İlçe / Mahalle:** Türkiye'deki tüm il, ilçe ve mahalle verisinin (API veya Seeding ile) sisteme eklenmesi.
- **Posta Kodu:** Otomatik tamamlama desteği.
- **Harita Entegrasyonu:** Adres girerken pinleme yapabilme (Opsiyonel).

### 🚛 C. Kargo Entegrasyonu Hazırlığı
- Adreslerin kargo firmalarının (Aras, Yurtiçi, Trendyol Express vb.) beklediği formatta (İl/İlçe kodları ile) saklanması.

---

## 11. GELECEK FAZ ÖNERİLERİ (Platform Vizyonu)

Wixi'nin rakiplerinden ayrışması için analize şu modüllerin de dahil edilmesi önerilir:

### 📢 A. Kampanya & Promosyon Yönetimi
- **Dinamik Kuponlar:** Tek kullanımlık veya limitli indirim kodları.
- **Sepet Kuralları:** "X TL üzeri kargo bedava", "X al Y öde" gibi otomatik indirim motoru.

### 📊 B. Analitik & Raporlama (Dashboard)
- **Satış Isı Haritası:** Siparişlerin hangi şehirlerden yoğun geldiği.
- **Depo Analitiği:** Stok devir hızı ve kritik seviyedeki ürünler için akıllı tahminleme.
- **Ciro Raporları:** Günlük, haftalık ve aylık bazda net kâr analizi.

### 🖼️ C. Merkezi Medya Yönetimi
- **Dosya Yöneticisi:** Ürün görsellerinin merkezi olarak saklanması ve otomatik yeniden boyutlandırılması (Thumbnail üretimi).

### 📝 D. CMS (İçerik Yönetim Sistemi)
- **Kurumsal Sayfalar:** KVKK, İptal/İade Koşulları sayfalarının Admin panelinden yönetilmesi.
- **Blog Modülü:** SEO trafiği çekmek için makale paylaşım alanı.

### ❤️ E. Müşteri Sadakat Modülü
- **Favoriler (Wishlist):** Ürün takibi.
- **Puan Sistemi:** Alışveriş yaptıkça kazanılan "Wixi Puan" sistemi.

---

**Sonuç:** Bu analiz, Wixi'yi basit bir e-ticaret scriptinden tam kapsamlı bir **Ticari İşletim Sistemi (Commercial OS)** haline getirecek yol haritasıdır. İlk odak noktası **Depo ve Stok** altyapısı olmalı, eş zamanlı olarak **Storefront UI** iyileştirmeleriyle profesyonel görünüm tamamlanmalıdır.
