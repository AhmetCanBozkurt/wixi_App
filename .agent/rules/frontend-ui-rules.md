# WIXI Frontend UI Standartları

Bu doküman, sistem içerisindeki Modal, Form ve Input bileşenlerinin "Eski Frontend" kalitesine ve sadeliğine sadık kalarak, yeni Vanilla CSS yapısında nasıl kullanılacağını belirler.

## 1. Modal Tasarım Standardı
Gereksiz gölgelerden, blur (glassmorphism) efektlerinden ve devasa renklerden kaçınılıp işlevsel, sade ve temiz bir yapı tercih edilmelidir.

**HTML/CSS Yapısı:**
- **Overlay:** Arka planda siyah, hafif saydam bir katman (`rgba(0, 0, 0, 0.5)`). Z-index değeri `50` civarı olmalıdır.
- **Modal Container:** Beyaz (`#ffffff`) veya Koyu Temada (`var(--bg-secondary)`) mat renkli. Köşeler hafif yuvarlak (`border-radius: 8px`), maksimum genişlik (`max-width: 4xl` / `800px` civarı).
- **Header:** Üstte başlık ve sağ tarafta bir çarpı (`FaTimes`). Arasında hafif boşluk (`mb-4`). Altında ayırıcı maskeli düz bir çizgi *kullanılmamalıdır*.
- **Body / Dış Boşluklar (Padding):** İçerikler modal duvarlarına çok yaklaşmamalı, doygun bir `padding: 24px` (`p-6`) kullanılmalıdır.

## 2. Form ve Input Standardı
Inputlar temiz, net sınırları olan, odağı belli eden bir yapıda olmalıdır.

**Standart Görünüm Kuralları:**
- **Label:** Inputun hemen üstünde, `block`, `text-sm`, `font-medium`, `text-gray-700` veya Dark modda `var(--text-muted)` renginde.
- **Input Alanı:**
  - `w-full` (bulunduğu grid hücresini kaplamalı).
  - İnce bir border (katı renk, `1px solid var(--border-glass)` veya benzeri mat gri).
  - Köşeler hafif oval (`border-radius: 6px`).
  - İç dolgu (`padding: 8px 12px` / `px-3 py-2`).
  - Arka plan (`background: var(--bg-primary)`).
  - Focus durumunda mutlaka belirgin bir ring veya border renk değişimi (`outline: none`, `border-color: var(--color-primary)`).

## 3. Grid Yapısı (Yerleşim)
Form elemanları alt alta düz bir şekilde dizilmemeli, form genişse özellikler Grid sistemi ile yan yana hizalanmalıdır.
- Büyük formlarda `grid grid-cols-2 gap-4` formülü kullanılmalı.
- Checkbox'lar için alt alta listeler yerine, `flex items-center gap-4` ile yatay dizilimler tercih edilmelidir.

## 4. Advanced Data Table (Filtreler)
- Mümkün olan tüm tablolarda sütun altı "Özel Filtre" ve "Kelime Arama" seçenekleri aktif edilmelidir (`FaFilter`, `FaSearch`).
- Filtre inputları başlık altına uyumlu küçük inputlar (`text-xs`) şeklinde yerleştirilmelidir.
