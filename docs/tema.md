# 🎨 WİXİ CLIENT - PREMIUM VANILLA CSS TEMA VE STİL STANDARTLARI

**Son Güncelleme:** 2026-04-10  
**Versiyon:** 3.0 (Premium Glassmorphism & Vanilla CSS Modülleri)

Bu döküman, projedeki üst düzey Premium görsel standartları ve Vanilla CSS yapılandırmasını belirler. Önceki sürümlerde yer alan TailwindCSS ve Utility-class yaklaşımı **tamamen terk edilmiştir**. Tüm yeni geliştirmelerde **saf CSS ve CSS Modules** (örn: `Button.module.css`) kullanılarak benzersiz, dinamik ve ultra-modern bir arayüz geliştirilecektir.

---

## 📋 İÇİNDEKİLER

1. [Premium Tasarım Felsefesi](#1-premium-tasarım-felsefesi)
2. [Renk Paleti ve CSS Değişkenleri](#2-renk-paleti-ve-css-değişkenleri)
3. [Tipografi](#3-tipografi)
4. [Glassmorphism & Gölgeler](#4-glassmorphism--gölgeler)
5. [Komponent Kuralları (CSS Modules)](#5-komponent-kuralları-css-modules)
6. [Animasyonlar ve Geçişler](#6-animasyonlar-ve-geçişler)
7. [Toast/Toaster Kullanımı](#7-toasttoaster-kullanımı)

---

## 1. Premium Tasarım Felsefesi

- **Kuruluş:** Uygulama, kurumsal bir ciddiyet ile modern estetiği birleştiren "Premium Dark" temasını esas alır. 
- **Sadelik (Simplicity):** Gereksiz süslemelerden ve aşırı parlaklıktan kaçınılır. "Aşırı Sade" ama "Kaliteli" bir his önceliklidir.
- **Konsistans:** Tüm bileşenler aynı köşe yumuşatması (border-radius) ve renk derinliğini kullanmalıdır.
- **Tailwind Yasağı:** Bütün stiller, komponentlerin yanındaki `.module.css` dosyalarında barınır.

---

## 2. Renk Paleti ve CSS Değişkenleri

Uygulamanın kalbi `index.css` dosyasıdır. Aşağıdaki değişkenler tüm modern bileşenlerde standarttır:

```css
:root {
  /* DARK OBSIDIAN BACKGROUND */
  --bg-primary: #020617; /* Deepest Navy/Slate */
  --bg-secondary: #0f172a; /* Slate 900 */
  
  /* SURFACES (Clean & Subtle Glass) */
  --surface: #1e293b; /* Slate 800 */
  --surface-hover: #334155; /* Slate 700 */
  --surface-glass: rgba(30, 41, 59, 0.4);
  --surface-glass-hover: rgba(51, 65, 85, 0.6);
  --border-glass: rgba(255, 255, 255, 0.05);
  
  /* VIBRANT BRAND COLORS */
  --color-primary: #3b82f6; /* Modern Blue */
  --color-primary-glow: rgba(59, 130, 246, 0.2);
  --color-accent: #06b6d4; /* Cyan */
  --color-success: #10b981;
  --color-danger: #ef4444;

  /* TYPOGRAPHY */
  --text-main: #f8fafc; /* Slate 50 */
  --text-muted: #94a3b8; /* Slate 400 */
  --text-secondary: #cbd5e1; /* Slate 300 */

  /* SPACING & BORDER RADIUS */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;
}
```

---

## 3. Tipografi

Sistemin çok daha modern görünmesi için Google Fonts üzerinden **'Inter'** veya **'Outfit'** tarzı temiz sans-serif fontlar kullanılmalıdır.

- Ana Başlıklar (H1, H2): Çok kalın (`font-weight: 700`), hafif `letter-spacing` (harf arası boşluk) içermeli ve gradient renkle doldurulmuş (Text Gradient) olmalıdır.
- Alt Metinler (Body): `--text-muted` rengi ile okunabilir ve yorucu olmayan bir tonda olmalıdır.

---

## 4. Glassmorphism & Gölgeler

Kartlarda veya formlarda katı arka planlar (solid background) yerine bulanık (blur) cam efekti kullanılacaktır.

**Standart Glass Sınıfı Örneği (`.module.css` içi):**
```css
.card {
  background: var(--surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card:hover {
  transform: translateY(-4px);
  background: var(--surface-glass-hover);
  border-color: var(--color-primary-glow);
  box-shadow: 0 12px 40px 0 var(--color-primary-glow);
}
```

---

## 5. Komponent Kuralları (CSS Modules)

Her React elementi, kendi izolasyonlu stiline sahip olmalıdır.

**✅ DOĞRU Kullanım:**
```tsx
import styles from './Button.module.css';

export function Button({ children, variant = 'primary' }) {
  return (
    <button className={`${styles.base} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

**❌ YANLIŞ Kullanım:**
```tsx
// Tailwind veya Inline style kesinlikle kullanılmamalı!
<button className="bg-blue-500 rounded px-4 py-2" style={{ marginTop: 10 }}>
  Yanlış Kullanım
</button>
```

---

## 6. Animasyonlar ve Geçişler

Tüm hover, focus ve aktif durum geçişlerinde `cubic-bezier(0.4, 0, 0.2, 1)` kullanılmalı, geçiş süresi olarak `0.3s` ideal kabul edilmelidir. Sayfa geçişleri ve yüklenmeler, `keyframes` ile tasarlanmış basit bir `fadeIn` veya `slideUp` efekti ile taçlandırılmalıdır.

---

## 7. Toast/Toaster Kullanımı

Uygulamanın herhangi bir yerinde gerçekleşen hata ve başarı mesajları **KESİNLİKLE** React-Hot-Toast veya benzeri global ve estetik bir Toaster mekanizması aracılığıyla kullanıcıya sunulmalıdır. Konsol logları (test aşaması hariç) ve çirkin `alert()` kutuları kesinlikle kullanılmamalıdır.

```tsx
import toast from 'react-hot-toast';

// Başarı:
toast.success("Giriş işlemi başarıyla tamamlandı!", {
  style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-success)' }
});

// Hata:
toast.error("Şifre yanlış girildi.", {
  style: { background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--color-danger)' }
});
```
