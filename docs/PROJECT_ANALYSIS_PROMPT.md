# 🧠 PROJECT ANALYSIS & MODULAR SYSTEM BOOTSTRAP PROMPT  
**Hedef Model:** Gemini Pro  
**Amaç:** Mevcut backend ve frontend dosyalarımı analiz ederek kurumsal, modüler, genişleyebilir bir sistem altyapısı oluşturmanı istiyorum.

---

# 1️⃣ GENEL KAPSAM

Sana backend ve frontend dosyalarımı aşama aşama vereceğim. Görevin:

1. **Var olan sistemi detaylı analiz etmek**  
2. **Eksikleri çıkarmak**  
3. **Yeni kurumsal bir altyapı tasarlamak**  
4. **Modüler bir multi-app platform mimarisi kurmak**  
5. **Sistemin gelecekte Web, Mobil ve Masaüstü uygulamalarına uyumlu olmasını sağlamak**

---

# 2️⃣ BEKLENTİLER

## 🔍 A. VAR OLAN SİSTEMİN ANALİZİ

Backend ve Frontend tarafında şu analizleri yap:

### Backend için:
- Mimari yapı
- Katmanlar ve Separation of Concerns değerlendirmesi
- Domain yapısı
- API Endpoint düzeni
- Güvenlik zaafiyetleri
- Loglama durumu
- E-posta sistemi
- Kullanıcı ve Rol yönetimi
- Performans ve ölçeklenebilirlik
- Kod temizlik seviyesi (SOLID, DRY, Clean Code)
- Gereksiz karmaşıklık veya kötü pratikler

### Frontend için:
- Component yapısı
- UI State Management
- React/Next/Angular yapısına uygunluk
- Router yapısı
- Menü-Yetki yapısının uygulanma düzeyi
- Styling sistemi (CSS, Tailwind, Styled Components)
- Performans & Optimizasyon
- Güvenlik (XSS, token yönetimi)
- Modülerlik ve reusable component yapısı

---

## 🔥 B. SIFIRDAN MODÜLER KURUMSAL ALT YAPI TASARIMI

Senin tasarlamanı istediğim kurumsal özellikler:

### 1. **Temel Sistem Altyapısı**
- Clean Architecture / Hexagonal / DDD değerlendirmesi yapıp en idealini seç
- Modüler Plugin Yapısı
- Event Bus / Message Queue önerisi
- API Versioning
- Genişleyebilir servis mimarisi

---

### 2. **Sistem Tabloları (WIXI_ ile başlayacak)**

Bütün sistem tabloları:
WIXI_USERS
WIXI_ROLES
WIXI_USER_ROLES
WIXI_MENUS
WIXI_ROLE_MENU_PERMISSIONS
WIXI_LOGS
WIXI_MAIL_QUEUE
WIXI_NOTES
WIXI_NOTE_CONTENT
WIXI_FILES
Her tablo için şunları oluştur:

- Kolon listesi (Data Type + PK + FK)
- Index önerisi
- İlişki diyagramı (text-based olabilir)
- Migration düzeni

---

### 3. **Zorunlu Sistem Modülleri**

Aşağıdaki modüllerin kurulumunu sistemsel olarak sen tasarla:

#### ✔ Loglama Sistemi
- DB Log
- File Log
- External Log (Elastic)
- Queue üzerinden async log

#### ✔ Mail Servisi
- Template System
- Mail Queue + Retry
- SMTP/Transactional Mail Service entegrasyon önerisi

#### ✔ Kullanıcı Yönetimi
- JWT/Refresh Token
- MFA / Opsiyonel 2FA
- IP Limit / Session Limit
- Password Policy
- OAuth2 entegrasyon potansiyeli

#### ✔ Role & Menu & Permission Yapısı
- Rol bazlı ekran görme
- Menü bazlı aksiyon yetkisi
- Component-level permission önerisi
- Admin Panel entegrasyonu

#### ✔ Not Alma Modülü (Notion benzeri)
- Workspace
- Page/Subpage
- Drag-drop content blocks
- Multi-user collaboration için temel UI/Backend önerisi

---

### 4. **Modüler Mimari (Multi-App Framework)**

Aşağıdaki modülleri eklenebilir/çıkarılabilir hale getirecek:

- Finans Yönetimi
- Randevu Yönetimi
- Dosya Yönetimi
- Mesajlaşma sistemi (opsiyonel)
- İçerik Yönetimi
- Workflow Engine (opsiyonel)

Her modül için:
- Klasör yapısı
- Domain modeli
- API tasarımı
- Frontend component yapısı
- Multi-tenancy önerisi

---

### 5. **Frontend için Sistem Mimarisi**

Tasarım beklentilerim:

- Role-based Menu Renderer
- Global Permission Hook'ları
- Admin Panel Template önerisi
- Reusable Page Builders
- Notion benzeri block editor için konsept tasarım
- Dark/Light Theme System
- Component Library önerisi (MUI, AntD, Chakra, Tailwind + Headless UI)

---

# 3️⃣ TESLİM ŞABLONU

Aşağıdaki formatta yanıt ver:

---

## **(1) Genel Sistem Analizi**

## **(2) Backend Eksiklikleri**

## **(3) Frontend Eksiklikleri**

## **(4) Önerilen Kurumsal Altyapı**

### 4.1 Backend Yapı  
### 4.2 Frontend Yapı  

## **(5) WIXI_ Tabloları Tasarımı**
Her tablo için:
- Kolonlar
- İlişkiler
- Indexler

## **(6) Sistem Modülleri ve API Tasarımı**

## **(7) Admin Panel Gereksinimleri**

## **(8) Modüler Sistem Planı**

## **(9) Roadmap (Aşama Aşama Yapılacaklar)**

## **(10) Ek Geliştirme Önerileri**

---

# 4️⃣ DOSYALARI İNCELEME MODU

Ben sana backend ve frontend klasör/dosya içeriklerini gönderdikçe:

- Ayrıntılı analiz et  
- Yapısal hataları çıkar  
- Refactor öner  
- Gerekirse alternatif dizayn oluştur  
- Mevcut sistemi daha güçlü hale getir  

Her yeni dosya verdiğimde tekrar incelemeye devam et.

---

# 5️⃣ TALİMAT

**Yanıtların aşırı detaylı olsun.**  
Örnek klasör yapısı, örnek API endpointleri ve örnek modeller istiyorum.  
Bir nevi kendi frameworkümüzü oluşturuyormuşuz gibi düşün.
