# 🎨 WİXİ CLIENT - TEMA VE STİL STANDARTLARI

**Son Güncelleme:** 2026-01-21  
**Versiyon:** 2.0

Bu döküman, projedeki görsel standartları ve tema yapılandırmasını belirler. **Tüm yeni geliştirmelerde bu tanımlara uyulmalıdır.**

---

## 📋 İÇİNDEKİLER

1. [Renk Paleti](#1-renk-paleti)
2. [CSS Variables](#2-css-variables)
3. [Tipografi](#3-tipografi)
4. [Spacing ve Layout](#4-spacing-ve-layout)
5. [Komponent Kuralları](#5-komponent-kuralları)
6. [Animasyonlar](#6-animasyonlar)
7. [Dark Mode](#7-dark-mode)
8. [Toast/Toaster Kullanımı](#8-toasttoaster-kullanımı)
9. [Icon Kullanımı](#9-icon-kullanımı)
10. [Örnekler ve Anti-Pattern'ler](#10-örnekler-ve-anti-patternler)

---

## 1. Renk Paleti

### 1.1 Ana Renkler (Tailwind Config)

| Renk Adı | Hex Kodu | Tailwind Class | Kullanım Alanı |
|----------|----------|----------------|----------------|
| **Primary** | `#2f73f2` | `bg-primary`, `text-primary` | Ana butonlar, linkler, vurgular |
| **Secondary** | `#547593` | `bg-secondary`, `text-secondary` | İkincil butonlar, labellar |
| **Success** | `#3cd278` | `bg-success`, `text-success` | Başarı mesajları, onay ikonları |
| **Destructive** | `hsl(var(--destructive))` | `bg-destructive`, `text-destructive` | Hata, silme, uyarı |
| **Accent** | `hsl(var(--accent))` | `bg-accent`, `text-accent` | Öne çıkan elementler |

### 1.2 Venus Tema Renkleri

| Renk Adı | Hex Kodu | Tailwind Class | Kullanım Alanı |
|----------|----------|----------------|----------------|
| **Midnight Text** | `#102d47` | `text-midnight_text` | Ana metin rengi (light mode) |
| **Grey** | `#668199` | `text-grey` | İkincil metinler, placeholder |
| **Section** | `#f8fafc` | `bg-section` | Alternatif section arka planı |
| **Misty Blue** | `#c0d5fb` | `bg-MistyBlue` | Hafif mavi vurgular |

### 1.3 Dark Mode Renkleri

| Renk Adı | Hex Kodu | Tailwind Class | Kullanım Alanı |
|----------|----------|----------------|----------------|
| **Dark Mode BG** | `#081738` | `bg-darkmode` | Dark mode ana arka plan |
| **Dark Light** | `#000f30` | `bg-darklight` | Dark mode card arka planı |
| **Dark Border** | `#224767` | `border-dark_border` | Dark mode çerçeveler |

---

## 2. CSS Variables

### 2.1 Light Mode (`:root`)

```css
:root {
  --background: 0 0% 100%;           /* Beyaz */
  --foreground: 222 47% 30%;         /* Koyu mavi-gri */
  --card: 0 0% 98%;
  --primary: 187 71% 42%;            /* Turkuaz */
  --accent: 330 81% 61%;             /* Pembe */
  --destructive: 0 84% 60%;          /* Kırmızı */
  --muted: 0 0% 98%;
  --border: 0 0% 90%;
  --radius: 0.5rem;
}
```

### 2.2 Dark Mode (`.dark`)

```css
.dark {
  --background: 222 47% 11%;         /* Koyu lacivert */
  --foreground: 0 0% 98%;            /* Beyaz */
  --primary: 187 71% 52%;            /* Açık turkuaz */
  --accent: 330 81% 71%;             /* Açık pembe */
  --border: 217 32% 17%;
}
```

### 2.3 Kullanım

```tsx
// ✅ DOĞRU: CSS Variable kullan
<div className="bg-background text-foreground border-border">
  İçerik
</div>

// ❌ YANLIŞ: Hardcoded renk kullanma
<div style={{ backgroundColor: '#ffffff', color: '#102d47' }}>
  İçerik
</div>
```

---

## 3. Tipografi

### 3.1 Font Ailesi

Proje, Tailwind'in varsayılan `font-sans` ailesini kullanır (Inter, system-ui).

### 3.2 Font Boyutları

| Class | Boyut | Kullanım |
|-------|-------|----------|
| `text-xs` | 12px | Etiketler, küçük notlar |
| `text-sm` | 14px | Tablolar, form labelları |
| `text-base` | 16px | Normal metin |
| `text-lg` | 18px | Alt başlıklar |
| `text-xl` | 20px | Başlıklar |
| `text-2xl` | 24px | Sayfa başlıkları |
| `text-3xl` | 30px | Hero başlıkları |
| `text-4xl` | 36px | Landing page başlıkları |

### 3.3 Font Ağırlıkları

| Class | Ağırlık | Kullanım |
|-------|---------|----------|
| `font-normal` | 400 | Normal metin |
| `font-medium` | 500 | Label, vurgulu metin |
| `font-semibold` | 600 | Alt başlıklar |
| `font-bold` | 700 | Başlıklar |

---

## 4. Spacing ve Layout

### 4.1 Container

```tsx
// Merkezi container yapılandırması
<div className="container mx-auto px-4">
  {/* İçerik */}
</div>
```

| Özellik | Değer |
|---------|-------|
| **Max Width (2xl)** | 1400px |
| **Padding** | 2rem (32px) |
| **Centering** | `margin: 0 auto` |

### 4.2 Spacing Scale

```
4   = 1rem  = 16px
6   = 1.5rem = 24px
8   = 2rem  = 32px
12  = 3rem  = 48px
16  = 4rem  = 64px
20  = 5rem  = 80px
```

### 4.3 Border Radius

| Class | Değer | Kullanım |
|-------|-------|----------|
| `rounded-sm` | `calc(var(--radius) - 4px)` | Küçük elementler |
| `rounded-md` | `calc(var(--radius) - 2px)` | Form inputları |
| `rounded-lg` | `var(--radius)` = 0.5rem | Kartlar, butonlar |
| `rounded-xl` | 12px | Modal, büyük kartlar |
| `rounded-full` | 9999px | Avatar, badge |

### 4.4 Shadow

```tsx
// Standart gölgeler
<div className="shadow-sm">Hafif gölge</div>
<div className="shadow-md">Orta gölge</div>
<div className="shadow-lg">Belirgin gölge</div>

// Proje özel gölgeleri
<div className="shadow-service">Service kartları için</div>
<div className="shadow-dark-md">Floating elementler için</div>
```

---

## 5. Komponent Kuralları

### 5.1 Genel Kurallar

1. **Tailwind Öncelikli**: Tüm stillendirme Tailwind CSS utility class'ları ile yapılmalı
2. **Inline Style Yasak**: `style={{...}}` kullanımından kaçınılmalı
3. **Hardcoded Renk Yasak**: Hex kodları (`#ff0000`) yerine Tailwind class kullanın

### 5.2 Buton Standartları

```tsx
// Primary Buton
<Button variant="default">Primary Action</Button>
// className: bg-primary text-primary-foreground

// Secondary Buton
<Button variant="secondary">Secondary Action</Button>

// Destructive Buton
<Button variant="destructive">Sil</Button>

// Ghost Buton
<Button variant="ghost">İptal</Button>

// Outline Buton
<Button variant="outline">Outline</Button>
```

### 5.3 Input Standartları

```tsx
<Input
  className="border-input bg-background"
  placeholder="Placeholder text"
/>
```

### 5.4 Card Standartları

```tsx
<Card className="bg-card border-border shadow-sm">
  <CardHeader>
    <CardTitle className="text-card-foreground">Başlık</CardTitle>
  </CardHeader>
  <CardContent>
    İçerik
  </CardContent>
</Card>
```

---

## 6. Animasyonlar

### 6.1 Tanımlı Animasyonlar

| Animation Class | Süre | Kullanım |
|-----------------|------|----------|
| `animate-fade-in` | 0.8s | Sayfa yüklenme, modal açılış |
| `animate-fade-in-delay` | 0.8s (+0.3s delay) | Sıralı fade animasyonları |
| `animate-fade-in-up` | 0.8s | Aşağıdan yukarı giriş |
| `animate-slide-in-from-left` | 0.8s (+0.2s) | Soldan giriş |
| `animate-slide-in-from-right` | 0.8s (+0.4s) | Sağdan giriş |
| `animate-accordion-down` | 0.2s | Accordion açılış |
| `animate-accordion-up` | 0.2s | Accordion kapanış |
| `animate-spin-slow` | 3s infinite | Yavaş dönen loader |

### 6.2 Animasyon Kullanım Örnekleri

```tsx
// Sayfa girişi
<main className="animate-fade-in">
  {/* İçerik */}
</main>

// Modal açılış
<Dialog>
  <DialogContent className="animate-fade-in">
    {/* Modal içeriği */}
  </DialogContent>
</Dialog>

// Liste elemanları (sıralı)
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {item.name}
  </div>
))}
```

---

## 7. Dark Mode

### 7.1 Genel Bilgi

Proje `class` tabanlı dark mode kullanır (`darkMode: 'class'`).

### 7.2 Dark Mode Toggle

```tsx
// Dark mode aktifleştirme
document.documentElement.classList.add('dark');

// Dark mode kapatma
document.documentElement.classList.remove('dark');
```

### 7.3 Komponent Yazarken Dark Mode Desteği

```tsx
// ✅ DOĞRU: Dark mode varyantları ekle
<div className="bg-white dark:bg-darkmode text-midnight_text dark:text-gray-100">
  İçerik
</div>

<div className="border border-gray-200 dark:border-dark_border">
  Çerçeveli alan
</div>

// ✅ DOĞRU: CSS Variable kullan (otomatik dark mode)
<div className="bg-background text-foreground border-border">
  CSS Variable ile otomatik tema
</div>
```

### 7.4 Dark Mode Test Kontrol Listesi

- [ ] Metin okunabilir mi?
- [ ] Arka plan kontrastı yeterli mi?
- [ ] Çerçeveler görünür mü?
- [ ] Butonlar ve linkler ayırt edilebilir mi?
- [ ] Gölgeler düzgün görünüyor mu?

---

## 8. Toast/Toaster Kullanımı

> ⚠️ **KURAL**: Tüm hata ve başarı mesajları **Toaster** ile gösterilmelidir.

### 8.1 Temel Kullanım

```tsx
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      variant: 'default',
      title: '✅ Başarılı',
      description: 'İşlem tamamlandı'
    });
  };

  const handleError = () => {
    toast({
      variant: 'destructive',
      title: '❌ Hata',
      description: 'Bir sorun oluştu'
    });
  };
}
```

### 8.2 Toast Varyantları

| Variant | Kullanım | Emoji |
|---------|----------|-------|
| `default` | Başarı, bilgi | ✅ ℹ️ |
| `destructive` | Hata, uyarı | ❌ ⚠️ |

### 8.3 Mesaj Standartları

```typescript
// ❌ YANLIŞ: Hardcoded mesaj
toast({ description: 'Kayıt başarılı!' });

// ✅ DOĞRU: Sabitlerden çağır (ileride implemente edilecek)
import { MESSAGES } from '@/constants/messages';
toast({ description: MESSAGES.SAVE_SUCCESS });
```

---

## 9. Icon Kullanımı

### 9.1 Tercih Edilen Kütüphaneler

1. **React Icons (FaXxx)**: Admin panel ikonu
2. **Lucide React**: UI komponet ikonları

### 9.2 Kullanım Örnekleri

```tsx
// React Icons
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

<FaUser className="w-4 h-4" />
<FaCog className="w-5 h-5 text-grey" />

// Lucide React
import { Globe, Menu, X } from 'lucide-react';

<Globe className="h-4 w-4" />
<Menu size={24} />
```

### 9.3 Icon Boyut Standartları

| Boyut | Class | Kullanım |
|-------|-------|----------|
| XS | `w-3 h-3` | Inline ikonlar |
| SM | `w-4 h-4` | Buton içi, tablo |
| MD | `w-5 h-5` | Menü, navigasyon |
| LG | `w-6 h-6` | Feature kartları |
| XL | `w-8 h-8` | Hero section |

---

## 10. Örnekler ve Anti-Pattern'ler

### 10.1 ✅ Doğru Kullanımlar

```tsx
// Renk kullanımı
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Kaydet
</button>

// Dark mode desteği
<div className="bg-white dark:bg-darkmode border border-gray-200 dark:border-dark_border">
  Kart içeriği
</div>

// Toast ile mesaj
toast({
  variant: 'default',
  title: '✅ Başarılı',
  description: 'Değişiklikler kaydedildi'
});
```

### 10.2 ❌ Yanlış Kullanımlar

```tsx
// ❌ Hardcoded renk
<button style={{ backgroundColor: '#2f73f2' }}>Kaydet</button>

// ❌ Inline style
<div style={{ padding: '16px', margin: '8px' }}>İçerik</div>

// ❌ Dark mode desteği yok
<div className="bg-white text-black">Sadece light mode</div>

// ❌ Console.log ile mesaj
console.log('Kayıt başarılı');

// ❌ Alert ile mesaj
alert('Bir hata oluştu!');
```

---

## 📎 Hızlı Referans

### Sık Kullanılan Class Kombinasyonları

```tsx
// Sayfa container
"container mx-auto px-4 py-8"

// Card
"bg-card border border-border rounded-lg shadow-sm p-6"

// Form input
"w-full border border-input bg-background rounded-md px-3 py-2"

// Primary button
"bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2"

// Link
"text-primary hover:text-primary/80 underline-offset-4 hover:underline"

// Badge
"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"

// Table header
"bg-muted text-muted-foreground font-medium text-left px-4 py-2"
```

---

**Döküman Sonu**  
*Bu döküman güncel tutulmalı ve yeni standartlar eklendikçe güncellenmelidir.*
