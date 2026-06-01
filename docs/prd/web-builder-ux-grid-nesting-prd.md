# Web Builder - Izgara Yapışma (Grid Snap), Katman Yerleştirme (Nesting), Şema Tabanlı Modal Veri Girişi ve Premium Animasyonlar PRD

**Tarih:** 2026-05-27  
**Durum:** Derinlemesine Analiz / Taslak  
**Versiyon:** 3.0 (Premium UX, Animasyon ve Standart Komponent Entegrasyonu)  

---

## 1. Giriş ve Gelişmiş Problem Tanımı

Mevcut Wixi Web Builder, tek boyutlu dikey bir blok dizilimini (`layout: LayoutComponent[]`) desteklemektedir. Bu durum, modern e-ticaret siteleri ve kurumsal sayfalar oluşturulurken ciddi tasarım ve kullanım kısıtlamalarına yol açmaktadır:

1. **Katmanlama ve İç İçe Yerleştirme (Nesting) Eksikliği:** Kullanıcılar bir "Kutu (Container)", "Grid/Kolon Sistemi", veya "Tab/Akordeon" gibi taşıyıcı katmanlar ekleyip, bu katmanların içerisine istedikleri diğer bileşenleri (Görsel, Metin, Buton vs.) serbestçe yerleştirememektedir.
2. **Grid/Izgara Kontrolü (Grid Snapping) Yokluğu:** Bileşenler 12'li standart ızgara düzenine göre hizalanamakta, kolonsal genişlikler (örn. 3/12, 6/12) görsel sürükle-bırak veya genişlik kulpları (resize handles) ile kolayca yönetilememektedir.
3. **Cramped (Sıkışık) Veri Giriş Alanı:** Ekip Üyeleri, Hizmetler, SSS veya Fiyat Listesi gibi dinamik listeler (`json-array` tipi prop'lar) Properties Panel'in dar sağ yan menüsünde (genişlik ~250px) inline olarak düzenlenmeye çalışılmaktadır. Bu durum, özellikle metinlerin uzun olduğu veya görsellerin/linklerin eklenmesi gerektiği durumlarda çok kötü bir kullanıcı deneyimine (UX) neden olmaktadır.

Bu PRD çalışması, yukarıda belirtilen eksiklikleri ortadan kaldırmak amacıyla, **Wixi Premium Dark & Glassmorphism** standartlarına ve `ComponentShowcase` sayfasındaki standart Wixi UI bileşenlerine tam uyumlu çözümleri derinlemesine sunar.

---

## 2. Standart Wixi UI Bileşenleri Entegrasyonu

Mevcut şemalarda ve düzenleme alanlarında custom html veya dış kütüphane bileşenleri kullanmak yerine, Wixi'nin `src/frontend/src/shared/ui` altında yer alan standart atom ve molekül bileşenleri kullanılacaktır.

### 2.1. Kullanılacak Standart Bileşenler

| UI Görevi | Kullanılacak Wixi Komponenti | Showcase Parametreleri & Ayarlar |
|---|---|---|
| **Veri Giriş Paneli (Modal)** | `Modal` (Wixi UI) | `size="lg"`, Custom Glassmorphism yapısı. |
| **Kaydet, İptal, Düzenle Butonları** | `Button` (Wixi UI) | `variant="primary"`, `variant="secondary"`, `variant="glass"`, `variant="danger"`. |
| **Metin Girişleri** | `Input` (Wixi UI) | `required` ve `leftIcon` desteği. |
| **Seçim & Açılır Menüler** | `Select` veya `ComboBox` (Wixi UI) | Searchable dropdown desteği için `ComboBox`. |
| **Açık/Kapalı Durumları** | `Switch` (Wixi UI) | `label` ve `description` detayları ile. |
| **Görsel Seçici / Yükleyici** | `ImageUpload` (Wixi UI) | Profil resimleri için `shape="circle"`, bannerlar için `shape="square"`. |
| **İlişkisel / Tablosal Veriler** | `AdvancedDataTable` (Wixi UI) | `sortable={true}`, `selectable={true}` özellikleri ile. |
| **Durum Etiketleri** | `Badge` (Wixi UI) | `variant="success" showDot` veya `outline` parametreleriyle. |
| **Silme / Kritik Onaylar** | `Swal` (SweetAlert2) | Wixi Obsidian Dark stili (`confirmButtonColor: 'var(--color-primary)'`, `cancelButtonColor: 'var(--color-danger)'`, `background: 'var(--bg-secondary)'`). |
| **Bildirimler** | `toast` (React-Hot-Toast) | Dark modal stili ve sınır çizgisi (`border: '1px solid var(--color-success/danger)'`). |

---

## 3. Katman Yerleştirme (Nesting) ve Ağaç Mimarisi

İç içe bileşen yapısını desteklemek için mevcut düz veri yapısının (`LayoutComponent[]`) hiyerarşik bir ağaca dönüştürülmesi gereklidir.

### 3.1. Ağaç Yapılı Layout (Tree-Based Layout)
Mevcut `LayoutComponent` interface'i genişletilerek `children` özelliği eklenir:

```typescript
export interface LayoutComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: LayoutComponent[]; // Rekürsif ağaç yapısı
}
```

### 3.2. Sürükle-Bırak Hiyerarşisi (dnd-kit Nesting)
- Canvas üzerinde eleman sürüklenirken `active` ve `over` bileşenlerin ebeveyn-çocuk ilişkileri hesaplanır.
- Sürüklenen eleman bir `grid-column` veya `section-container` üzerine getirildiğinde, elemanın o taşıyıcı içine eklenmesi için iç dropzone alanları aktif hale gelir.

### 3.3. Sabit Bileşenlerin Korunması (Navbar & Footer Modeli)
Ağaç yapılı nesting modelinde, sayfanın en üstünde yer alan **Navbar** ve en altında yer alan **Footer** bileşenleri bu hiyerarşik sürükle-bırak ağacının tamamen **dışında sabit** kalacaktır.
- **Layers Panel:** Navbar en üstte sabit, Footer en altta sabit olarak listelenmeye devam edecektir (`layerFixedRow`). Araya sürüklenebilecek herhangi bir ebeveyn katman bu sabit sınırları aşamaz.
- **Editor Canvas:** Sürükle-bırak alanının (`DndContext`) dışında en üst ve en altta bağımsız olarak render edileceklerdir. Ayarları yine "Global Bileşenler" paneli üzerinden konfigüre edilmeye devam edecektir.


---

## 4. Şema Tabanlı Modal Veri Girişi (Modal-Based Data Entry)

Inline veri girişi yerine, karmaşık veya tekrarlı veri içeren bileşenlerde (SSS, Üyeler, Ürünler) veri girişinin, `ComponentShowcasePage.tsx` dosyasında yer alan **"Premium Modal Yapısı"** ile birebir uyumlu, geniş ve lüks bir pop-up üzerinden yapılması sağlanacaktır.

### 4.1. UX Akışı ve Çalışma Prensibi
1. Sağ paneldeki Properties Panel'de `json-array` tipi bir alan (örneğin **Ekip Üyeleri**) algılandığında, sıkışık inline form yerine sadece bir özet bilgisi ve devasa bir **"Veriyi Düzenle / Eklemek için Tıkla"** butonu gösterilir.
2. Butona basıldığında orta ekranda lüks, modern ve `shared/ui` içindeki standart `<Modal size="lg">` bileşeni açılır.
3. Modal, `ComponentShowcasePage`'deki gibi **grup başlıkları (`sectionHeader`)**, **giriş ızgarası (`inputGrid`)** ve **durum anahtarları (`Switch` / `ImageUpload` / `ComboBox`)** içeren profesyonel bir form düzeniyle render edilir.

### 4.2. Modal İç Yapısı ve Alan Eşlemeleri (Showcase Uyumlu)
Modal içeriği, düzenlenecek liste elemanlarının her biri için dinamik kartlar (`Card`) halinde render edilir:
- **Bölüm Başlıkları (`sectionHeader`):** Her veri grubunun üstünde (örn: "Genel Bilgiler", "Sosyal Bağlantılar") ince bir sınır çizgisiyle ayrılmış başlıklar yer alır.
- **Form Izgarası (`inputGrid`):** Alanlar tek bir satırda sıkışmak yerine, showcase'deki gibi `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` yapısıyla yan yana 2 veya 3 kolon halinde hizalanır.
- **Fotoğraf / Dosya Yükleme (`ImageUpload`):** Logo, profil resimleri ve kapaklar için sürükle-bırak destekli görsel yükleme alanı modal içinde gösterilir.
- **Açılır Seçenekler (`ComboBox`):** Arama desteğiyle birlikte ilişkili CMS veri şemalarının seçimi ComboBox ile yapılır.
- **Onay Kutuları & Butonlar (`Button`):** Değişiklikleri Kaydet (`variant="primary"`) ve Vazgeç (`variant="ghost"`) butonları modal'ın standart alt bilgi (footer) alanında yer alır. Eleman silinmek istendiğinde, SweetAlert2 onay kutusu obsidian dark stiliyle tetiklenir.

---

## 5. Izgara Yapışma (Grid Snapping) ve Kolon Kontrolleri

Tasarımcının sayfayı bölümlere ayırırken 12-kolonluk standardı hissetmesi ve sürüklediği bileşenin bu ızgara çizgilerine "yapışması" (snap) sağlanacaktır.

### 5.1. 12-Kolon Izgara Sistemi ve Sürükleme Kılavuzları
- Canvas üzerinde bir `grid-row` seçildiğinde veya içerisine bir eleman sürüklendiğinde, arka planda hafif saydam 12 adet dikey sütun kılavuzu belirir.
- Kolon çizgilerine yaklaşma mesafesi (Threshold) 15px olarak belirlenir. Bu sınıra yaklaşan eleman otomatik olarak kolona yapışır (snapping).

```
| | | | | | | | | | | |   <-- Sanal 12 Kolon Arka Planı (Sürükleme anında aktif olur)
┌─────────────────────┐
│  Bileşen (Span: 6)  │
└─────────────────────┘
```

### 5.2. Genişlik Ayarlama Kulpları (Width Resize Handles)
Bileşen seçildiğinde sol ve sağ kenarlarında dikey kulplar belirir. Kullanıcı bu kulpları sürükleyerek elemanın kaç kolon kaplayacağını görsel olarak ayarlar:

```
    Resize Handle (Sol)                      Resize Handle (Sağ)
          ↓                                         ↓
     ||[ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Seçili Bileşen ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ]||
        ←───────────────────────────────────────────────→
                    Görsel Kolon Genişliği: 6 / 12
```

Sürükleme bırakıldığında, `UPDATE_COMPONENT_PROPS` tetiklenerek bileşenin prop'ları arasına ilgili kolon sınıfı veya stil değeri yazılır:
`{ spanDesktop: 6 }` → CSS'te `grid-column: span 6 / span 12` olarak karşılık bulur.

### 5.3. Cihaz Boyutlarında (Mobil/Tablet) Hizalama ve Duyarlılık (Responsiveness) Sorununun Çözümü
* **Problem:** Arayüzün üst barındaki Cihaz Önizleme butonları (Desktop, Tablet, Mobil) ile görünüm değiştirildiğinde, canvas kutusunun genişliği (örn. Mobil için `maxWidth: 480px`) daralmaktadır. Ancak bileşenlerin CSS kodlarındaki `@media (max-width: 768px)` kuralları **tarayıcının ana pencere genişliğini** baz aldığından, editör ana ekranı hala geniş (desktop boyutunda) olduğu için tetiklenmemektedir. Bu sebeple bileşenler mobil modda dahi sanki webdeymiş gibi yan yana, geniş ve hizalanmamış olarak kalmaktadır.

* **Mimari Çözüm Planı:**

  #### Yöntem A: CSS Container Queries (Konteyner Sorguları) — *Modern & FSD Standartlarına Uygun*
  Bileşenlerin ekran genişliğine göre değil, içinde bulundukları **Canvas kutusunun genişliğine** göre şekil alması sağlanır.
  - **Canvas Tanımlaması:** Canvas kapsayıcısına CSS'te bir sorgu konteyneri (query container) kimliği atanır:
    ```css
    .canvas {
      container-type: inline-size;
      container-name: canvas-viewport;
    }
    ```
  - **Bileşen CSS Güncellemesi:** Bileşenlerin responsive kuralları `@media` yerine `@container` ile yazılır:
    ```css
    /* Eski Yapı */
    @media (max-width: 768px) {
      .servicesGrid { grid-template-columns: 1fr; }
    }
    
    /* Yeni Yapı (Konteyner Genişliği 768px'in altına indiğinde tetiklenir) */
    @container canvas-viewport (max-width: 768px) {
      .servicesGrid { grid-template-columns: 1fr; }
    }
    ```
  *Bu yöntem, tarayıcı penceresinden bağımsız olarak bileşenlerin tam olarak simüle edilen genişlikte kusursuz mobil düzene girmesini sağlar.*

  #### Yöntem B: Editör Durum Sınıflarının Enjeksiyonu (Viewport-Class Injector)
  Konteyner sorgularına alternatif olarak, aktif viewport durumuna göre canvas'a responsive sınıflar atanır ve stiller bu sınıflara göre ezilir:
  - **Canvas DOM:** `<div className={`${styles.canvas} ${styles[viewport]}`}>` (örn: `styles.mobile`)
  - **Bileşen CSS:**
    ```css
    .servicesGrid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
    /* Mobil görünüm seçildiğinde kolonları dikey yığ */
    :global(.mobile) .servicesGrid {
      grid-template-columns: 1fr;
    }
    ```

---


## 6. Detaylı Arayüz Animasyonları ve Mikroskobik UX Efektleri

Builder'ın hantal hissettirmesini önlemek ve premium bir deneyim sunmak için CSS Modules tabanlı akıcı animasyonlar entegre edilmelidir.

### 6.1. Dnd-Kit Sıralama ve Ekleme Animasyonları
- **Bileşen Kaydırma (Layout Transitions):** Sürükle-bırak sırasında elemanların yer değiştirmesi, ani zıplamalar yerine yumuşak bir kayma efektiyle gerçekleşir:
  `transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);`
- **Gölge ve Derinlik (Glow Transition):** Taşınan eleman havaya kalktığında (isDragging) altındaki gölge büyür ve cam efekti belirginleşir:
  `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 15px var(--color-primary-glow);`

### 6.2. Canvas Üzerindeki Görsel Gösterge Animasyonları
- **Aktif Seçim Çerçevesi (Selection Outline Pulse):** Seçilen bileşenin kenarlıkları yavaş bir neon dalgalanması efekti içerir:
  ```css
  @keyframes selectionPulse {
    0% { border-color: var(--color-primary); box-shadow: 0 0 0 0 var(--color-primary-glow); }
    50% { border-color: var(--color-accent); box-shadow: 0 0 8px 2px var(--color-primary-glow); }
    100% { border-color: var(--color-primary); box-shadow: 0 0 0 0 var(--color-primary-glow); }
  }
  ```
- **Insert Zone Parıldaması:** İki bileşen arasındaki boşluğa sürükleme yapıldığında insert zone çizgisi dikeyde genişler ve parlar:
  `transform: scaleY(1.5); background-color: var(--color-accent);`

### 6.3. Paneller and Modal Geçişleri
- **Sidebar Daralma/Açılma (Slide Transition):** Sol ve sağ paneller gizlendiğinde veya açıldığında canvas alanı yumuşak bir şekilde genişler/daralır:
  `transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);`
- **Modal Pop-Up Animasyonu:** Standart Wixi `Modal` açılırken hafif bir büyüme ve opaklık artışı ile gelir:
  ```css
  @keyframes modalScaleIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  ```

---

## 7. Profesyonel Builder İçin Eksik Olan Gelişmiş Özellikler

Daha profesyonel, "Webflow" veya "Shopify Plus" düzeyinde bir arayüz ve altyapı için mevcut sistemdeki eksiklikler ve eklenmesi gereken ana modüller:

### 7.1. Dinamik Veri Bağlama (Dynamic Data Binding & CMS Integration)
* **Eksiklik:** Mevcut bileşenlerin içerikleri tamamen statik prop'lar (hardcoded string/resim URL) ile beslenmektedir.
* **Geliştirme:** Bileşenin bir alanına veri girerken doğrudan veritabanındaki dinamik alanlar bağlanabilmelidir.
  * *Örnek:* Bir Text bloğunun içeriğine `{{CMS.CorpBlog.Latest.Title}}` veya `{{Product.Price}}` bind edilebilmelidir. Arayüzde veri girerken ComboBox içinden bu CMS şemaları seçilebilir olmalıdır.

### 7.2. Görsel CSS Tasarım Müfettişi (Visual CSS Styles Inspector)
* **Eksiklik:** Kullanıcılar şu anda bileşenin margins, paddings, border-width, box-shadow gibi görsel stil detaylarını sadece önceden tanımlanmış kısıtlı Select seçenekleriyle değiştirebilmektedir.
* **Geliştirme:** Properties Panel'e ek olarak bir "Stil Müfettişi" kutusu konmalıdır. Kullanıcı bir elemana tıkladığında, görsel bir kutu modeli (box-model) üzerinden padding/margin değerlerini sürükleyerek veya rakam yazarak doğrudan değiştirebilmeli ve bu değerler satır içi CSS olarak yazılmalıdır.

```
       Margin (Dış Boşluk)
    ┌───────────────────────┐
    │       [  12 px  ]     │
    │  ┌─────────────────┐  │
    │  │  Padding (İç)   │  │
    │  │   [  8 px  ]    │  │
    │  └─────────────────┘  │
    └───────────────────────┘
```

### 7.3. Sürüm ve Değişiklik Günlüğü (Visual History Log)
* **Eksiklik:** Geri al/Yeniden yap (Undo/Redo) işlemleri sadece klavye kısayolu ile yapılmakta ve arka planda neyin değiştiği görülmemektedir.
* **Geliştirme:** Versiyon geçmişi modülüne ek olarak, aktif oturumdaki tüm kullanıcı hareketlerini (örn: *"SSS Bloğu Eklendi"*, *"Başlık Yazısı Değiştirildi"*, *"Görsel Boyutu Güncellendi"*) listeleyen görsel bir "Tarihçe Günlüğü" paneli eklenmelidir. Kullanıcı bu listedeki herhangi bir adıma tıklayarak o ana geri dönebilmelidir.

### 7.4. Hazır Şablon Enjeksiyonu (Layout Presets & Wireframes)
* **Eksiklik:** Sayfaya yeni bir şey eklerken sadece tekil ve boş bileşenler eklenebilmektedir.
* **Geliştirme:** Sol paneldeki "Bileşenler" sekmesine ek olarak "Hazır Şablonlar" sekmesi gelmelidir. Kullanıcı "Modern İletişim Sayfası", "E-Ticaret Hero Blok + Üçlü Kategori" gibi hazır sayfa şablonlarını tek tıkla sayfaya enjekte edebilmeli, sistem bu şablonu oluşturan iç içe tüm alt ağaç yapısını otomatik üretmelidir.

### 7.5. Çoklu Dil Desteği ve `Languages` Entegrasyonu (Multi-Language)
* **Eksiklik:** Mevcut sayfa yerleşim metinleri sadece tek dilde saklanmakta ve dinamik çoklu dil geçişi sunulmamaktadır.
* **Geliştirme:** Wixi `Languages` tablosunda (`WIXI_LANGUAGES`) aktif olan tüm diller doğrudan builder'a çekilir.
  - **Arayüz Kontrolü:** Editörün üst barında bir **Dil Seçim Dropdown'u** (Language Switcher) yer alır. Kullanıcı hangi dile tıklarsa, canvas o dildeki içeriklerle yüklenir.
  - **Veri Yapısı (Localized Props):** Layout component hiyerarşisi (yapısal bloklar, grid genişlikleri, kolon sayıları) tekil kalır; ancak text, textarea ve richtext tipindeki içerik prop'ları dil kodlarıyla anahtarlanmış bir nesne olarak saklanır:
    ```json
    {
      "id": "comp-1",
      "type": "hero",
      "props": {
        "title": {
          "tr-TR": "Harika Fırsatlar",
          "en-US": "Awesome Deals"
        },
        "buttonText": {
          "tr-TR": "Keşfet",
          "en-US": "Explore"
        },
        "overlayOpacity": 0.4
      }
    }
    ```
  - **Kaydetme Mantığı:** Modal veri girişinde veya Properties Panel'de bir metin değiştirildiğinde, o an üst barda seçili olan aktif dil koduna (`tr-TR` vb.) göre ilgili prop güncellenir. Bu sayede tasarım bir kere yapılırken, içerik tüm dillerde bağımsız olarak doldurulmuş olur.

### 7.6. Koyu Mod & Açık Mod (Dark / Light Mode Toggle)
* **Eksiklik:** Builder teması varsayılan olarak Premium Dark stilindedir ancak oluşturulan mağaza sayfalarının açık (light) modda nasıl görüneceğini test etmek mümkün değildir.
* **Geliştirme:** Editör üst barına **Koyu/Açık Mod Önizleme Butonu (Switch)** eklenir.
  - **CSS Değişkenleri Geçişi:** Butona basıldığında, iframe/canvas gövdesine `.light-mode` veya `.dark-mode` sınıfı enjekte edilir. Bu sınıf, `:root` içindeki renk değişkenlerini (`--bg-primary`, `--text-main` vb.) standart Wixi CSS Tema Değişkenlerine göre anında tersine çevirerek canlı WYSIWYG önizlemesi sunar.
  - **Tema Konfigürasyonu:** `ThemeConfig` içinde renk paleti hem koyu mod hem de açık mod için iki farklı nesne olarak (`colors.dark` ve `colors.light`) saklanır ve müşteri storefront'ta mod değiştirdiğinde bu renk grupları yüklenir.

### 7.7. Custom HTML & Bölüm Şablon Pazarı (Marketplace & Custom Presets)
* **Eksiklik:** Kullanıcılar yazdıkları özel HTML/CSS/JS kodlarını (`custom-html` bileşeni) diğer sayfalarında tekrar kullanamamakta ve diğer kullanıcıların veya Wixi'nin hazır premium HTML tasarımlarını kendi sayfalarına kolayca gömememektedir.
* **Geliştirme:** Custom HTML bileşeni için **Paylaşımlı Şablon Pazarı (Template Marketplace)** ve **Özel Tasarım Kütüphanesi** altyapısı geliştirilecektir.
  - **Şablon Olarak Kaydet (Save as Preset):** Store admin, tasarlayıp kodladığı bir Custom HTML bloğunu "Şablon Olarak Kaydet" butonuyla kendi kütüphanesine kaydedebilir. Bu şablon merkezi `WIXI_SECTION_TEMPLATES` tablosunda saklanır.
  - **Bölüm Şablon Pazarı (Section Marketplace):** Kullanıcı boş bir HTML bloğu eklediğinde, blok üzerinde "Şablon Kütüphanesinden Seç" butonu açılır. Buradan:
    1. *Global Şablonlar:* Wixi ekibinin hazırladığı premium, animasyonlu hazır HTML bloklar.
    2. *Özel Şablonlar:* Mağazanın kendi kaydettiği şablonlar.
    3. *Topluluk/Pazar Yeri Şablonları:* Diğer mağazaların paylaştığı veya satışa sunduğu şablonlar.
  - **Paylaşım Kodu Entegrasyonu (Share Code / Token):** Her şablon benzersiz bir paylaşım kodu (örn: `WIX-HTML-7A9D`) üretir. Bir müşteri, başka bir müşteriden aldığı bu kodu editördeki "Kodu İçe Aktar" (Import Share Code) alanına yazarak o şablonu anında kendi editörüne gömebilir.
  - **Güvenli Kod Ayrıştırma (Sanitization):** İçe aktarılan HTML ve Script kodları, cross-site scripting (XSS) açıklarını önlemek amacıyla backend ve frontend seviyesinde DOMPurify veya benzeri güvenli filtrelerden geçirildikten sonra sadece o tenant scope'unda çalışacak şekilde izole render edilir.

### 7.8. Medya Kütüphanesi ve Akıllı Görsel Seçici (Media Library)
* **Eksiklik:** Properties Panel veya veri ekleme modallarında görsel eklemek için sadece düz URL girişi yapılabilmektedir. Kullanıcının bilgisayarından doğrudan dosya seçip yükleyeceği veya daha önce yüklediği görseller arasından seçim yapabileceği bir kütüphane yoktur.
* **Geliştirme:** Görsel prop alanları için düz metin girdisi yerine Wixi `ImageUpload` bileşeni entegre edilir.
  - **Medya Galeri Modali:** Görsele tıklandığında açılacak ortak bir "Medya Galerisi Modali" üzerinden, kullanıcının daha önce yüklediği tüm görseller listelenir, yeni görsel sürükle-bırak yöntemiyle sunucuya yüklenir ve tek tıkla ilgili prop alanına bind edilir.

### 7.9. Etkileşimli Hover/Focus Stil Ayarları (State Styling)
* **Eksiklik:** Buton veya linklerin normal renkleri değiştirilebilmekte ancak farenin üzerine gelindiğindeki (:hover) veya odaklanıldığındaki (:focus) renk/stil değişimleri görsel olarak yönetilememektedir.
* **Geliştirme:** Stil sekmesine **Durum Seçici (State Selector: Normal / Hover / Focus)** eklenir. Tasarımcı "Hover" durumunu seçtiğinde yaptığı stil değişiklikleri (örn. primary renk yerine primaryHover renginin atanması) CSS'e otomatik olarak `.btn:hover { background: ... }` şeklinde yazılır.

### 7.10. Iframe Güvenli Kod Sandbox Altyapısı (Sandbox Preview)
* **Eksiklik:** Editör içindeki canvas doğrudan ana React DOM içinde render edildiği için, özel HTML veya JS kodlarında yapılacak hatalar ya da script çakışmaları tüm editör arayüzünü çökertip kullanılamaz hale getirebilmektedir.
* **Geliştirme:** Canvas önizleme ekranı izole bir `<iframe>` içine taşınacaktır.
  - **Script İzolasyonu:** Iframe `sandbox="allow-scripts allow-same-origin"` özellikleri ile sınırlandırılarak harici scriptlerin (Google Analytics, Chat widget vb.) editörün yönetim paneline (Left/Right panels) müdahale etmesi veya çökertmesi önlenecektir.
  - **PostMessage Entegrasyonu:** Editör ile iframe arasındaki tüm state senkronizasyonu (`layout`, `theme` güncellemeleri) yüksek performanslı tarayıcı içi `postMessage` API'si ile sağlanacaktır.

### 7.11. Ortak / Senkronize Bölümler (Global Blocks / Synced Sections)
* **Eksiklik:** Tasarımcı bir sayfada hazırladığı "Kampanya Bandı" veya "Özel Duyuru Kartı" gibi bir bölümü birden fazla sayfaya kopyaladığında, bu bloğun içeriğini güncellemek istediğinde tüm sayfaları tek tek açıp değiştirmek zorundadır.
* **Geliştirme:** Herhangi bir bölüm (Section), properties panel üzerinden **"Global Blok Yap" (Make Global Block)** butonuyla ortak bileşene dönüştürülebilir.
  - **Eşzamanlı Güncelleme:** Bir global bloğun içeriği veya tasarımı herhangi bir sayfada düzenlendiğinde, o bloğu içeren tüm diğer sayfaların konfigürasyonları arka planda otomatik olarak güncellenir ve yayına yansır.

### 7.12. Kaydırma ve Giriş Animasyon Yöneticisi (Animate-On-Scroll Builder)
* **Eksiklik:** Sayfa açılışında veya aşağı kaydırıldığında bileşenlerin ekrana yumuşak bir şekilde gelmesini (fade-in, slide-up, zoom) sağlayan giriş animasyonları görsel olarak ayarlanamamaktadır.
* **Geliştirme:** Properties Panel'e **Animasyon (Motion) Sekmesi** eklenir. Tasarımcı bileşen bazında:
  - Giriş efekti (Fade, Slide, Zoom, Reveal), animasyon süresi (duration) ve gecikme süresini (delay) görsel kontrollerle ayarlar.
  - Bu ayarlar CSS animasyon sınıfları (`animate-fade-up` vb.) olarak derlenir ve sayfa kaydırıldığında Intersection Observer API'si ile tetiklenir.

### 7.13. Canlı Arama Motoru ve Sosyal Paylaşım Önizlemesi (SEO Preview Cards)
* **Eksiklik:** SEO sekmesinde Meta Title ve Meta Description alanları yazılmakta ancak bu verilerin Google aramalarında veya WhatsApp/LinkedIn paylaşımlarında nasıl görüneceğine dair görsel bir geri bildirim sunulmamaktadır.
* **Geliştirme:** SEO sekmesine **Canlı Snippet Önizleyici (Live Snippet Preview)** eklenir.
  - Kullanıcı meta verileri yazarken, Google Arama Sonucu kartı ve OpenGraph (Sosyal Paylaşım) Link Kartı (Görsel + Başlık + Açıklama) anlık olarak gözünün önünde güncellenerek mükemmel SEO optimizasyonu sağlanır.

### 7.14. Çoklu Kullanıcı Eşzamanlı Düzenleme Kilidi (Collaborative Editing Lock)
* **Eksiklik:** Aynı tenant altındaki iki farklı mağaza yöneticisi aynı sayfayı web builder üzerinde açtığında, birbirlerinin üzerine kaydederek veri kaybına ve layout çakışmalarına (race conditions) sebep olmaktadır.
* **Geliştirme:** Sayfa editörde açıldığında veritabanı veya Redis üzerinde o sayfa için **Düzenleme Kilidi (Lock)** oluşturulur.
  - İkinci bir yönetici sayfayı açmaya çalıştığında sistem SweetAlert2 ile uyarı verir: *"Bu sayfa şu anda Ahmet Can Bozkurt tarafından düzenleniyor. Salt Okunur modda açabilirsiniz."* İlk kullanıcı editörü kapattığında kilit otomatik düşer.

### 7.15. Dinamik Form Tasarımcısı ve Veri Toplama (Dynamic Form Builder)
* **Eksiklik:** Mevcut `contact-form` bileşeni sadece sabit form alanlarına (Ad, E-posta, Telefon, Konu, Mesaj) sahiptir. Mağazaların özel anketler, kariyer başvuru formları (CV yüklemeli) veya bayilik talep formları gibi özel form şemaları tasarlaması mümkün değildir.
* **Geliştirme:** Modüler bir **Dinamik Form Bileşeni** geliştirilecektir.
  - **Alan Ekleme/Çıkarma:** Properties Panel üzerinden kullanıcılar forma dinamik olarak Text, Textarea, Dropdown, Checkbox ve File Upload (Dosya Yükleme) gibi alanlar ekleyebilecektir.
  - **Hedef Belirleme:** Form doldurulduğunda verilerin nereye gönderileceği seçilebilir olacaktır (e-posta adresine gönder, sisteme veri tabanı satırı olarak kaydet veya harici bir webhook API'sine POST et).

### 7.16. Tıklama Eylemleri ve Tetikleyici Yöneticisi (Action & Trigger Manager)
* **Eksiklik:** Builder'daki butonlar ve linkler sadece statik bir URL yönlendirmesi yapabilmektedir (`buttonLink`). Butonlara tıklandığında pop-up açma, sayfa içi yumuşak kaydırma (Anchor Scroll) veya özel script tetikleme (Pixel eventi vb.) gibi gelişmiş eylemler atanamamaktadır.
* **Geliştirme:** Buton ve link bileşenleri için bir **Eylem Yöneticisi (Action Manager)** eklenecektir. Tasarımcı eylem tipini seçebilir:
  1. *Link:* Klasik sayfa yönlendirmesi.
  2. *Anchor Scroll:* Sayfadaki belirli bir bileşenin ID'sine yumuşak geçişle kaydırma (Smooth Scroll).
  3. *Open Modal:* Wixi içinde tasarlanmış başka bir popup/modal bloğunu açma.
  4. *Trigger Event:* Facebook Pixel veya Google Tag Manager için özel bir analitik olay (event) tetikleme.

### 7.17. Cihaz Bazlı Stil Ezme (Viewport Style Overrides)
* **Eksiklik:** Bileşenler mobilde dikey olarak sıralansa bile, bazen bir bloğun masaüstünde `80px` iç boşluğa (padding), mobilde ise `20px` boşluğa sahip olması istenir. Şu anki sistemde masaüstü için ayarlanan padding mobilde de aynen kalmaktadır (veya tam tersi).
* **Geliştirme:** Properties Panel'deki stil ayarları (padding, margin, yazı boyutu, hizalama) **Viewport-Aware (Viewport'a Duyarlı)** hale getirilecektir.
  - Editörün üst barında hangi cihaz seçiliyse (Desktop/Mobile), stil panelinde yapılan değişiklikler sadece o cihaza özel stil kuralları (override) olarak kaydedilir.
  - *Örn:* Masaüstünde `paddingY: "80px"` iken, mobilde `style.mobile.paddingY: "20px"` olarak ezilir ve canvas anında güncellenir. Ayrıca bir bileşeni tamamen belirli cihazlarda gizleme opsiyonu (Responsive Visibility) eklenecektir.

### 7.18. A/B Bölünmüş Test Entegrasyonu (A/B Split Testing)
* **Eksiklik:** Mağaza sahipleri, iki farklı sayfa tasarımından hangisinin daha fazla satış veya e-bülten kaydı (dönüşüm) getirdiğini test edememektedir.
* **Geliştirme:** Web Builder'a **A/B Test Yönetim Katmanı** eklenecektir.
  - Yönetici tek bir slug (örn: `/kampanya`) için iki farklı düzen şeması (Varyasyon A ve Varyasyon B) hazırlar.
  - Ziyaretçilere bu varyasyonlar 50/50 oranında sunulur.
  - Sistem, butona tıklama veya form gönderme oranlarını analiz edip admin panelinde kazanan tasarımı belirler.

### 7.19. Yapay Zeka (AI) Destekli Sayfa Tasarımı ve Kredi Sistemi (AI Generator & Credit SaaS Model)
* **Açıklama:** Geliştirilen bu yeni esnek mimari (hiyerarşik ağaç yapısı ve şema tabanlı bileşenler), yapay zekanın (LLM) sıfırdan kusursuz sayfalar üretmesini son derece kolaylaştıracaktır. AI'ın doğrudan hataya açık HTML veya React kodları üretmesi yerine, sadece Wixi'nin önceden tanımlanmış `BLOCK_REGISTRY` şemasına uygun **JSON ağacı** üretmesi sağlanacaktır. Bu sayede üretilen sayfalar %100 CSS/JS hatasız ve Wixi standartlarında olacaktır.
* **Sistem Mekanizması:**
  - **AI Prompt Modali:** Kullanıcı bir prompt yazar (örn: *"Bana modern, siber güvenlik odaklı bir landing page üret. Hero, 4 kolon hizmet, SSS ve iletişim formu olsun"*).
  - **JSON Ağacı Üretimi (Backend AI Engine):** Backend, LLM'e (Gemini API vb.) sistemde yer alan bileşen tanımlarını ve şemalarını gönderir. LLM, bu şemalara göre içerikleri (metinler, başlıklar) kullanıcının sektörüne uygun doldurarak hiyerarşik bir `LayoutComponent[]` JSON'ı üretir.
  - **Kredi (Token) Yönetimi:**
    * Her tam sayfa üretimi (Full Page Generation) kullanıcının hesabından belirli bir kredi düşer (örn: 10 kredi).
    * Tekil blok üretimi (Section Generation - örn: *"SSS bloğu üret"*) veya içerik iyileştirme (AI Copywriter) daha düşük kredi tüketir (örn: 1 veya 0.2 kredi).
    * Görsel üretimi (DALL-E/Imagen ile görsel üretip Medya Kütüphanesine kaydetme) 2 kredi tüketir.
  - **SaaS & Ödeme Entegrasyonu:**
    * **`WIXI_TENANT_CREDITS`** tablosunda her tenant'ın mevcut kredisi saklanır.
    * Kullanıcılar Stripe (abonelik planı) üzerinden aylık paketlerine dahil gelen kredileri kullanır (örn: Pro planda aylık 100 kredi hediye).
    * Kredisi biten kullanıcılar admin panelinden ek kredi paketleri satın alabilir.

### 7.20. Storefront Dinamik Ürün & Katalog Entegrasyonu (E-Commerce Catalog Sync & Canvas Live Preview)
* **Açıklama:** Wixi bir e-ticaret altyapısı olduğu için builder bileşenlerinin (Örn: `featured-products`, `categories-grid`, `testimonials`, `brand-logos`, `faq`) statik metinler yerine doğrudan mağazanın gerçek veritabanı (DB) verilerinden beslenmesi gerekir. Projede yapılan incelemede, bu verilerin `StorefrontPage.tsx` tarafında `storefrontApi` çağrılarıyla (`getProducts`, `getCategories`, `getFaq` vb.) başarılı şekilde doğrudan veritabanından dinamik olarak çekildiği görülmüştür. Ancak, **`EditorCanvas.tsx` (Builder Editörü)** tarafında bu bileşenler sadece içi boş, gri iskelet (skeleton) kutuları render etmektedir. Bu durum, tasarımcının neyi tasarladığını editörde canlı görememesine (WYSIWYG uyumsuzluğu) yol açmaktadır.
* **Geliştirme:**
  - **Editör Canvas'ında Canlı DB Önizleme:** Editör canvas'ındaki ilgili bileşenler, yerel depolamadan alınan aktif mağaza kodu (`localStorage.getItem('wixi-active-tenant')`) üzerinden `storefrontApi` ile veritabanına bağlanacak ve gerçek verileri (gerçek ürün resimleri, adları, fiyatları, FAQ sorularını) editör ekranında canlı render edecektir.
  - **Properties Panel Koleksiyon/Ürün Seçici:** Özellikler paneline **"Koleksiyon/Ürün Seçici"** entegre edilir. Mağaza sahibi, "Yaz Sezonu Koleksiyonu" veya belirli 4 ürünü seçer.
  - **Sürekli Senkronizasyon:** Veritabanındaki ürün fiyatı veya ismi değiştiğinde, storefront'ta olduğu gibi editör ekranında da veriler anlık olarak güncellenir.
  - **Boş Veri Durumu (Fallback):** Eğer mağazada henüz hiç ürün, kategori veya FAQ kaydı girilmemişse (boş veritabanı durumu), editör canvas'ı boş veya hatalı görünmek yerine şık, premium tasarımlı hazır iskelet (skeleton) şablonları yedek (fallback) olarak gösterecektir.

### 7.21. Otomatik SEO JSON-LD Yapılandırılmış Veri Derleyici (Structured Data Auto-Generator)
* **Açıklama:** Arama motorlarının (Googlebot) sayfayı ve ürünleri tam anlamıyla indekslemesi için sayfa kodunda JSON-LD formatında şema işaretlemelerinin (Product, LocalBusiness, FAQ schema) bulunması zorunludur.
* **Geliştirme:** Web Builder, eklenen yapısal blokları analiz ederek JSON-LD şemalarını **otomatik üretip** sayfanın `<head>` kısmına gömer.
  - *Örn:* SSS (FAQ) bileşeni eklendiğinde ve sorular modal ile doldurulduğunda, Google SSS zengin sonuçlarında (rich snippets) çıkması için `FAQPage` şeması otomatik üretilir. Aynı durum ürün listeleme bileşenlerinde `Product` şeması için de geçerlidir.

### 7.22. Sunucu Tarafı Render (SSR) Uyumlu CSS Derleyici (SSR-Friendly Performance)
* **Açıklama:** Arayüz oluşturucuların (Page Builders) en büyük problemi sayfa yüklenme hızını yavaşlatan hantal ve satır içi yazılmış CSS/JS çıktılarıdır. Bu durum SEO puanını (Core Web Vitals) düşürür.
* **Geliştirme:**
  - Sayfa kaydedildiğinde, hiyerarşideki tüm bileşenlerin `toCss()` fonksiyonları backend üzerinde tek bir CSS dosyasında derlenir (minified) ve sunucu önbelleğine (Redis) yazılır.
  - Storefront sayfası sunucu tarafında (SSR) render edilirken bu CSS dosyası tek bir `<link>` etiketiyle sayfaya bağlanır. Sayfada hiçbir CSS-in-JS (satır içi stil) kütüphanesi kullanılmaz, böylece Google Lighthouse puanı 100/100 olarak korunur.

### 7.23. Sayfa Şablonu Oluşturma ve Kopyalama (Page Cloning & Private Templates)
* **Açıklama:** Mağaza yöneticilerinin yeni bir kampanya veya iniş sayfası (landing page) hazırlarken her seferinde sıfırdan başlamasını önlemek amacıyla sayfa kopyalama altyapısı kurulmalıdır.
* **Geliştirme:**
  - Sayfalar panelindeki eylemlere **"Sayfayı Kopyala" (Clone Page)** ve **"Şablon Olarak Kaydet" (Save as Template)** özellikleri eklenir.
  - Kaydedilen özel şablonlar mağazanın kendi şablon kütüphanesine eklenir ve yeni sayfa oluştururken tek tıkla seçilerek tüm yerleşim şeması yeni sayfaya kopyalanır.

---








## 8. Etkilenecek Dosyalar ve Değişiklik Listesi

### 8.1. Veri Modelleri (Domain & Application)
- **`src/frontend/src/entities/StorePage/model/types.ts`**
  - `LayoutComponent` interface'ine opsiyonel `children` ağaç yapısı eklenmeli.
- **`src/backend/.../WixiStoreSettings`**
  - Eğer ağaç yapısına geçilirse backend DTO ve JSON serileştirme test edilmeli.

### 8.2. Frontend Editör Bileşenleri
- **`src/frontend/src/features/ThemeBuilder/context/EditorContext.tsx`**
  - Ağaç yapısına uyumlu rekürsif reducer aksiyonları eklenmeli (`ADD_NESTED_COMPONENT`, `MOVE_NESTED_COMPONENT`, `REMOVE_NESTED_COMPONENT`).
- **`src/frontend/src/features/ThemeBuilder/canvas/EditorCanvas.tsx`**
  - Flat render yerine `comp.children` varsa kendini rekürsif olarak çağıran `<MiniRenderer />` yapısına geçilmeli.
  - Sürükle-bırak algılayıcıları (`DndContext` / `SortableContext`) nested (iç içe) sürüklemeyi destekleyecek şekilde güncellenmeli.
- **`src/frontend/src/features/ThemeBuilder/panels/PropertiesPanel.tsx`**
  - `json-array` veri tiplerini render eden `InlineRowEditor` yerine büyük verileri modalda açan buton ve tetikleyici mekanizma eklenmeli.
- **`src/frontend/src/features/ThemeBuilder/panels/LayersPanel.tsx`**
  - Ağaç yapısındaki alt katmanları (`children`) açılır-kapanır (collapsible) şekilde rekürsif listeleyecek şekilde güncellenmeli.

---

## 9. Uygulama ve Faz Planı

Geliştirmenin büyüklüğü göz önüne alınarak, ClickUp üzerinde **[[Web Builder] UX, Izgara Yapışma (Grid Snap) ve Katman Yerleştirme (Nesting) Geliştirmeleri](https://app.clickup.com/t/86exrevqk)** ana görevi altında 6 aşamalı bir alt görev (subtask) planı oluşturulmuştur:

### 📅 Faz Durumları ve ClickUp Görev Linkleri

*   **[ ] Faz 1: UX Hızlı Kazanım (Quick Win) — Modal Veri Girişi**
    *   **Durum:** Beklemede / Planlandı (To Do)
    *   **ClickUp Görevi:** [ClickUp #86exrevqp](https://app.clickup.com/t/86exrevqp)
    *   **Açıklama:** `PropertiesPanel`'de yer alan `json-array` alanları için modal desteği eklenmesi. Standart Wixi UI bileşenlerinin (`Modal`, `Input`, `ComboBox`, `Switch`, `ImageUpload`) entegrasyonu. SweetAlert2 onay kutularının ve React-Hot-Toast başarı/hata bildirimlerinin entegre edilmesi.

*   **[ ] Faz 2: Nested Layout Desteği (Kapsayıcı Katmanlar)**
    *   **Durum:** Beklemede / Planlandı (To Do)
    *   **ClickUp Görevi:** [ClickUp #86exrevqy](https://app.clickup.com/t/86exrevqy)
    *   **Açıklama:** `LayoutComponent` şemasının hiyerarşik yapıya dönüştürülmesi. `section-container`, `grid-row` ve `grid-column` gibi taşıyıcı (container) blokların eklenmesi. Editör Canvas ve Layers Panel'in rekürsif render desteği kazanması.

*   **[ ] Faz 3: Izgara Yapışma (Grid Snapping) & Kolon Kulpları**
    *   **Durum:** Beklemede / Planlandı (To Do)
    *   **ClickUp Görevi:** [ClickUp #86exrevr2](https://app.clickup.com/t/86exrevr2)
    *   **Açıklama:** Dikey 12-kolon ızgara kılavuz çizgilerinin çizilmesi. Kolon genişliğini ayarlayan görsel resize kulplarının eklenmesi ve snapping mantığının devreye alınması.

*   **[ ] Faz 4: Viewport Duyarlılık Çözümü & Premium Efektler**
    *   **Durum:** Beklemede / Planlandı (To Do)
    *   **ClickUp Görevi:** [ClickUp #86exrevrc](https://app.clickup.com/t/86exrevrc)
    *   **Açıklama:** Viewport daralmasında bileşenlerin desktop boyutunda kalma hatasının giderilmesi (CSS Container Queries `@container` veya Viewport-Class Injector). Seçim çerçevesi neon animasyonu, breadcrumbs ve insert zone parlamaları.

*   **[ ] Faz 5: İleri Seviye AI Entegrasyonu & SaaS Kredi Modeli**
    *   **Durum:** Beklemede / Planlandı (To Do)
    *   **ClickUp Görevi:** [ClickUp #86exrevrh](https://app.clickup.com/t/86exrevrh)
    *   **Açıklama:** Gemini API ile prompt üzerinden Wixi uyumlu hiyerarşik `LayoutComponent[]` JSON şemaları ürettirilmesi. `WIXI_TENANT_CREDITS` ve `WIXI_CREDIT_LOGS` tablolarıyla SaaS kredi modelinin entegre edilmesi.

*   **[ ] Faz 6: Custom HTML Şablon Pazarı (Marketplace & Presets)**
    *   **Durum:** Beklemede / Planlandı (To Do)
    *   **ClickUp Görevi:** [ClickUp #86exrevrr](https://app.clickup.com/t/86exrevrr)
    *   **Açıklama:** Custom HTML bileşenlerinin kaydedilmesi, paylaşım kodu (Share Code) ile içe aktarılması ve DOMPurify ile XSS açıklarının engellenmesi.

---

## 10. Doğrulama (Verification) Senaryoları

### 10.1. Katman Yerleştirme Doğrulaması
1. Sol panelden bir "Bölüm (Section)" bileşeni canvas'a sürüklenir.
2. Bu bölümün içerisine sol panelden sırasıyla "Izgara Satırı" ve "Kolonlar" bırakılır.
3. Layers panelinde bu hiyerarşi ağaç yapısı olarak açılıp kapatılarak gözlemlenir.

### 10.2. Şema Modal Doğrulaması
1. Ekip Üyeleri (team-grid) bileşeni seçilir.
2. Özellikler panelinde "Üyeleri Düzenle" butonuna tıklanır.
3. Açılan büyük modal üzerinde yeni bir üye eklenir, isim ve resim yazılır.
4. Üye silinmek istendiğinde SweetAlert2 onay kutusunun geldiği ve onay verilince silindiği doğrulanır.
5. Modal "Kaydet" denildiğinde ana canvas güncellenir ve sağ üst köşede "Veriler başarıyla güncellendi!" toaster mesajı belirir.
