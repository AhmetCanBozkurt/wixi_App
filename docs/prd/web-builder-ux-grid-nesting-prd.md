# Web Builder - Izgara Yapışma (Grid Snap), Katman Yerleştirme (Nesting), Şema Tabanlı Modal Veri Girişi ve Premium Animasyonlar PRD

**Tarih:** 2026-05-27  
**Durum:** Derinlemesine Analiz / Taslak  
**Versiyon:** 2.0 (Premium UX, Animasyon ve Standart Komponent Entegrasyonu)  

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

---

## 4. Izgara Yapışma (Grid Snapping) ve Kolon Kontrolleri

Tasarımcının sayfayı bölümlere ayırırken 12-kolonluk standardı hissetmesi ve sürüklediği bileşenin bu ızgara çizgilerine "yapışması" (snap) sağlanacaktır.

### 4.1. 12-Kolon Izgara Sistemi ve Sürükleme Kılavuzları
- Canvas üzerinde bir `grid-row` seçildiğinde veya içerisine bir eleman sürüklendiğinde, arka planda hafif saydam 12 adet dikey sütun kılavuzu belirir.
- Kolon çizgilerine yaklaşma mesafesi (Threshold) 15px olarak belirlenir. Bu sınıra yaklaşan eleman otomatik olarak kolona yapışır (snapping).

```
| | | | | | | | | | | |   <-- Sanal 12 Kolon Arka Planı (Sürükleme anında aktif olur)
┌─────────────────────┐
│  Bileşen (Span: 6)  │
└─────────────────────┘
```

### 4.2. Genişlik Ayarlama Kulpları (Width Resize Handles)
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

---

## 5. Detaylı Arayüz Animasyonları ve Mikroskobik UX Efektleri

Builder'ın hantal hissettirmesini önlemek ve premium bir deneyim sunmak için CSS Modules tabanlı akıcı animasyonlar entegre edilmelidir.

### 5.1. Dnd-Kit Sıralama ve Ekleme Animasyonları
- **Bileşen Kaydırma (Layout Transitions):** Sürükle-bırak sırasında elemanların yer değiştirmesi, ani zıplamalar yerine yumuşak bir kayma efektiyle gerçekleşir:
  `transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);`
- **Gölge ve Derinlik (Glow Transition):** Taşınan eleman havaya kalktığında (isDragging) altındaki gölge büyür ve cam efekti belirginleşir:
  `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 15px var(--color-primary-glow);`

### 5.2. Canvas Üzerindeki Görsel Gösterge Animasyonları
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

### 5.3. Paneller ve Modal Geçişleri
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

## 6. Profesyonel Builder İçin Eksik Olan Gelişmiş Özellikler

Daha profesyonel, "Webflow" veya "Shopify Plus" düzeyinde bir arayüz ve altyapı için mevcut sistemdeki eksiklikler ve eklenmesi gereken ana modüller:

### 6.1. Dinamik Veri Bağlama (Dynamic Data Binding & CMS Integration)
* **Eksiklik:** Mevcut bileşenlerin içerikleri tamamen statik prop'lar (hardcoded string/resim URL) ile beslenmektedir.
* **Geliştirme:** Bileşenin bir alanına veri girerken doğrudan veritabanındaki dinamik alanlar bağlanabilmelidir.
  * *Örnek:* Bir Text bloğunun içeriğine `{{CMS.CorpBlog.Latest.Title}}` veya `{{Product.Price}}` bind edilebilmelidir. Arayüzde veri girerken ComboBox içinden bu CMS şemaları seçilebilir olmalıdır.

### 6.2. Görsel CSS Tasarım Müfettişi (Visual CSS Styles Inspector)
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

### 6.3. Sürüm ve Değişiklik Günlüğü (Visual History Log)
* **Eksiklik:** Geri al/Yeniden yap (Undo/Redo) işlemleri sadece klavye kısayolu ile yapılmakta ve arka planda neyin değiştiği görülmemektedir.
* **Geliştirme:** Versiyon geçmişi modülüne ek olarak, aktif oturumdaki tüm kullanıcı hareketlerini (örn: *"SSS Bloğu Eklendi"*, *"Başlık Yazısı Değiştirildi"*, *"Görsel Boyutu Güncellendi"*) listeleyen görsel bir "Tarihçe Günlüğü" paneli eklenmelidir. Kullanıcı bu listedeki herhangi bir adıma tıklayarak o ana geri dönebilmelidir.

### 6.4. Hazır Şablon Enjeksiyonu (Layout Presets & Wireframes)
* **Eksiklik:** Sayfaya yeni bir şey eklerken sadece tekil ve boş bileşenler eklenebilmektedir.
* **Geliştirme:** Sol paneldeki "Bileşenler" sekmesine ek olarak "Hazır Şablonlar" sekmesi gelmelidir. Kullanıcı "Modern İletişim Sayfası", "E-Ticaret Hero Blok + Üçlü Kategori" gibi hazır sayfa şablonlarını tek tıkla sayfaya enjekte edebilmeli, sistem bu şablonu oluşturan iç içe tüm alt ağaç yapısını otomatik üretmelidir.

---

## 7. Etkilenecek Dosyalar ve Değişiklik Listesi

### 7.1. Veri Modelleri (Domain & Application)
- **`src/frontend/src/entities/StorePage/model/types.ts`**
  - `LayoutComponent` interface'ine opsiyonel `children` ağaç yapısı eklenmeli.
- **`src/backend/.../WixiStoreSettings`**
  - Eğer ağaç yapısına geçilirse backend DTO ve JSON serileştirme test edilmeli.

### 7.2. Frontend Editör Bileşenleri
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

## 8. Uygulama ve Faz Planı

Geliştirmenin büyüklüğü göz önüne alınarak 4 aşamalı bir yol haritası önerilmektedir:

### Faz 1: UX Hızlı Kazanım (Quick Win) — Modal Veri Girişi
- `PropertiesPanel`'de yer alan `json-array` alanları için modal desteği eklenmesi.
- Standart Wixi UI bileşenlerinin (`Modal`, `Input`, `ComboBox`, `Switch`, `ImageUpload`) entegrasyonu.
- SweetAlert2 onay kutularının ve React-Hot-Toast başarı/hata bildirimlerinin standart Wixi Obsidian temasıyla entegre edilmesi.

### Faz 2: Nested Layout Desteği (Kapsayıcı Katmanlar)
- `LayoutComponent` şemasının hiyerarşik yapıya dönüştürülmesi.
- `section-container`, `grid-row` ve `grid-column` gibi taşıyıcı (container) blokların eklenmesi.
- Editör Canvas ve Layers Panel'in rekürsif render desteği kazanması.

### Faz 3: Izgara Yapışma (Grid Snapping) & Kolon Kulpları
- Dikey 12-kolon ızgara kılavuz çizgilerinin çizilmesi.
- Kolon genişliğini ayarlayan görsel resize kulplarının eklenmesi ve snapping mantığının devreye alınması.

### Faz 4: Gelişmiş Özellikler ve Animasyonlar
- CMS dinamik veri bağlama altyapısının bootstrap edilmesi.
- Görsel tasarım müfettişinin eklenmesi.
- Dnd-kit animasyon geçişlerinin ve seçim çerçevesi puls efektinin entegre edilmesi.

---

## 9. Doğrulama (Verification) Senaryoları

### 9.1. Katman Yerleştirme Doğrulaması
1. Sol panelden bir "Bölüm (Section)" bileşeni canvas'a sürüklenir.
2. Bu bölümün içerisine sol panelden sırasıyla "Izgara Satırı" ve "Kolonlar" bırakılır.
3. Layers panelinde bu hiyerarşi ağaç yapısı olarak açılıp kapatılarak gözlemlenir.

### 9.2. Şema Modal Doğrulaması
1. Ekip Üyeleri (team-grid) bileşeni seçilir.
2. Özellikler panelinde "Üyeleri Düzenle" butonuna tıklanır.
3. Açılan büyük modal üzerinde yeni bir üye eklenir, isim ve resim yazılır.
4. Üye silinmek istendiğinde SweetAlert2 onay kutusunun geldiği ve onay verilince silindiği doğrulanır.
5. Modal "Kaydet" denildiğinde ana canvas güncellenir ve sağ üst köşede "Veriler başarıyla güncellendi!" toaster mesajı belirir.
