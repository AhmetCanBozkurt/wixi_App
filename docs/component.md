Aşağıdaki kurallara göre bana bir "tasarım patterni" oluşturmanı, bu pattern'i tüm proje boyunca
kullanmanı ve her oluşturacağın componentin:

- Ayrı bir klasörde yer almasını
- İçinde ayrı bir .jsx / .tsx dosyası olmasını
- Ayrı bir .module.css (veya .css) dosyası olmasını
- Gerekliyse test dosyası (.test.js / .spec.js)
- Component yapısının atomic-design veya belirleyeceğimiz pattern'e göre oluşturulmasını
- Kodun tamamen best practice standartlarına göre yazılmasını

istiyorum.

Aşağıdaki adımları sırayla uygula:

---

## 1. Adım: Pattern Analizi
Bana proje için en uygun **tasarım patternleri** listesini çıkar:
- Atomic Design
- Feature Based Architecture
- Component Driven Development
- Folder by Feature
- Folder by Component
- MVC / MVVM yapıları (front-end'e uyarlanmış şekilde)
Her pattern'in güçlü ve zayıf yanlarını yaz.
Sonunda bana tek bir pattern öner ve nedenini açıkla.

---

## 2. Adım: Dosya Yapısının Tasarlanması
Seçtiğin pattern'e göre bana tam bir proje dosya yapısı öner:
- src/
- components/
- hooks/
- services/
- styles/
- utils/
- pages/
- context/
- theme/
Gerekirse alt klasörleri de detaylandır (ör: atoms / molecules / organisms).

Her klasörün *niçin olduğunu* tek tek yaz.

---

## 3. Adım: Component Üretme Kuralları
Her yeni component oluştururken aşağıdaki formatı KESİNLİKLE takip et:

Her component için:
- `ComponentName/ComponentName.jsx`
- `ComponentName/ComponentName.module.css`
- `ComponentName/index.js`

Kod kuralları:
- Component tamamen bağımsız olacak
- Props açıkça yorumlanacak
- CSS BEM veya module.css yapısına göre yazılacak
- Responsive detayları eklenecek
- TypeScript kullanıyorsak interface'ler oluşturulacak
- Component örnek kullanım kodu yazılacak

---

## 4. Adım: Component Örneği Çıkar
Aşağıdaki örnek componentleri oluştur:

- Button (Atom)
- Input (Atom)
- Card (Molecule)
- Navbar (Organism)
- LoginForm (Page-level component)
- Global Layout (Template-level)
- Theme Provider + Hook

Her component için:
- Kod dosyası
- CSS dosyası
- Props açıklaması
- Örnek kullanım
- Genişletilebilirlik notları

---

## 5. Adım: Pattern Belirlendikten Sonra
Pattern’i netleştirdikten sonra:
- Tüm sistemi bu pattern'e göre inşa et
- Oluşturduğun bileşenleri adım adım genişlet
- UI kütüphanesi gerekiyorsa (MUI / Tailwind / Chakra / Pure CSS) öneri yap
- Performans odaklı optimizasyon önerileri ver
- Proje sonunda bana bir “Design System Documentation” hazırla

---
