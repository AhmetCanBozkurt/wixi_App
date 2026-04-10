# Lisans Sistemi Frontend Entegrasyonu

## ✅ Eklenen Dosyalar

### 1. LicenseService.ts
**Dosya:** `src/ApiServices/services/LicenseService.ts`

**Metodlar:**
- `validateLicense(licenseKey)` - Lisans anahtarını doğrula ve kaydet
- `getLicenseStatus()` - Admin lisans durumunu getir
- `getPublicLicenseStatus()` - Public lisans durumu (sadece geçerli/geçersiz)
- `clearLicenseCache()` - Lisans cache'ini temizle

**Kullanım:**
```typescript
import licenseService from '@/ApiServices/services/LicenseService';

// Lisans doğrula
const result = await licenseService.validateLicense('XXXX-XXXX-XXXX-XXXX');

// Lisans durumu
const status = await licenseService.getLicenseStatus();
```

---

### 2. LicenseKeyEntry.tsx
**Dosya:** `src/pages/Admin/LicenseKeyEntry.tsx`

**Özellikler:**
- ✅ Mevcut lisans durumu gösterimi
- ✅ Lisans anahtarı giriş formu
- ✅ API doğrulama
- ✅ Başarı/hata mesajları
- ✅ Bitiş tarihi ve kalan gün gösterimi
- ✅ Cache temizleme butonu
- ✅ Otomatik yönlendirme (başarılı girişten sonra)

**Route:**
```typescript
<Route path="/admin/license-key" element={<LicenseKeyEntry />} />
```

---

## 🔧 Yapılması Gerekenler

### 1. Route Tanımı Ekle

**Dosya:** `src/App.tsx` veya route tanımlarınızın olduğu dosya

```typescript
import LicenseKeyEntry from './pages/Admin/LicenseKeyEntry';

// Admin routes içine ekleyin:
<Route path="/admin/license-key" element={<LicenseKeyEntry />} />
```

---

### 2. Admin Menüsüne Ekle

**SQL Script:** `wixi.backend/initialize-admin-menu-permissions.sql`

```sql
-- Zaten eklenmiş:
INSERT INTO wixi_MenuPermissions (UserId, MenuPath, MenuText, MenuCategory, MenuIcon, IsVisible, DisplayOrder, CreatedAt)
VALUES 
    (@AdminUserId, '/admin/license-key', 'Lisans Yönetimi', 'Settings', 'Key', 1, 73, GETUTCDATE());
```

Bu SQL script'ini çalıştırdıktan sonra admin menüsünde "Lisans Yönetimi" görünecek.

---

### 3. Development Lisansı Oluştur

**SQL Script:** `wixi.backend/create-development-license.sql`

```sql
-- Bu script'i çalıştırın:
USE [wixi.D001];
GO
-- Script içeriği...
```

Bu script:
- 1 yıl geçerli development lisansı oluşturur
- Otomatik olarak aktif hale getirir
- Tüm admin endpoint'lerini açar

---

## 🚀 Kullanım

### Admin Panelden Lisans Girişi

1. Admin paneline giriş yapın
2. **Sistem > Lisans Yönetimi** menüsüne tıklayın
3. Lisans anahtarınızı girin (örn: `CN9E-BCSK-4TP3-BYVN`)
4. **Lisansı Doğrula ve Kaydet** butonuna tıklayın
5. Başarılı olursa otomatik olarak ana sayfaya yönlendirilirsiniz

### Lisans Durumu Kontrolü

Sayfa açıldığında otomatik olarak:
- Mevcut lisans durumu gösterilir
- Geçerli ise: Yeşil alert + bitiş tarihi + kalan gün
- Geçersiz ise: Sarı alert + yeni lisans giriş formu

### Cache Temizleme

Sağ üstteki **Cache Temizle** butonuna tıklayarak:
- Backend'deki lisans cache'i temizlenir
- Lisans durumu yeniden kontrol edilir
- Güncel bilgiler gösterilir

---

## 🎨 UI Özellikleri

### Geçerli Lisans
```
┌─────────────────────────────────────────┐
│ ✅ Lisans Geçerli                       │
│ Firma: Worklines Pro Consulting        │
│ Bitiş Tarihi: 07.12.2025 (365 gün kaldı)│
└─────────────────────────────────────────┘
```

### Geçersiz Lisans
```
┌─────────────────────────────────────────┐
│ ⚠️ Lisans Geçersiz veya Süresi Dolmuş   │
│ Yeni bir lisans anahtarı girmeniz       │
│ gerekmektedir.                          │
└─────────────────────────────────────────┘
```

### Lisans Giriş Formu
```
┌─────────────────────────────────────────┐
│ Lisans Anahtarı                         │
│ ┌─────────────────────────────────────┐ │
│ │ XXXX-XXXX-XXXX-XXXX                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [🔑 Lisansı Doğrula ve Kaydet]          │
└─────────────────────────────────────────┘
```

---

## 🔄 Entegrasyon Adımları

### Adım 1: Backend Hazırlık
```sql
-- 1. Development lisansı oluştur
USE [wixi.D001];
GO
-- create-development-license.sql çalıştır

-- 2. Menü izni ekle
-- initialize-admin-menu-permissions.sql çalıştır (lisans menüsü dahil)

-- 3. Backend'i yeniden başlat
cd wixi.backend/wixi.WebAPI
dotnet run
```

### Adım 2: Frontend Hazırlık
```typescript
// 1. Route ekle (App.tsx veya routes dosyanızda)
import LicenseKeyEntry from './pages/Admin/LicenseKeyEntry';

<Route path="/admin/license-key" element={<LicenseKeyEntry />} />

// 2. Frontend'i yeniden başlat
npm run dev
```

### Adım 3: Test
1. Admin paneline giriş yapın
2. Menüde "Lisans Yönetimi" görünmeli
3. Tıklayın ve lisans sayfası açılmalı
4. Mevcut lisans durumu gösterilmeli

---

## 🐛 Sorun Giderme

### Hata: "Lisans durumu alınamadı"

**Sebep:** Backend'de lisans kaydı yok

**Çözüm:**
```sql
-- create-development-license.sql çalıştır
```

### Hata: "Lisans doğrulanamadı"

**Sebep:** Lisans API'sine bağlanılamıyor veya lisans geçersiz

**Çözüm:**
1. Backend loglarını kontrol edin
2. API URL'sini kontrol edin (`appsettings.json`)
3. Lisans anahtarının doğru olduğundan emin olun

### Menüde "Lisans Yönetimi" Görünmüyor

**Sebep:** Menü izni eklenmemiş

**Çözüm:**
```sql
-- initialize-admin-menu-permissions.sql çalıştır
-- Veya manuel olarak:
INSERT INTO wixi_MenuPermissions (UserId, MenuPath, MenuText, MenuCategory, MenuIcon, IsVisible, DisplayOrder, CreatedAt)
VALUES 
    (@AdminUserId, '/admin/license-key', 'Lisans Yönetimi', 'Settings', 'Key', 1, 73, GETUTCDATE());
```

### Route Çalışmıyor

**Sebep:** Route tanımı eksik

**Çözüm:**
```typescript
// App.tsx veya routes dosyanızda:
<Route path="/admin/license-key" element={<LicenseKeyEntry />} />
```

---

## 📋 Checklist

### Backend
- [x] LicenseSettings Entity
- [x] LicenseService
- [x] AdminLicenseController
- [x] PublicLicenseController
- [x] LicenseValidationMiddleware
- [ ] Development lisansı oluştur (`create-development-license.sql`)
- [ ] Menü izni ekle (`initialize-admin-menu-permissions.sql`)

### Frontend
- [x] LicenseService.ts oluşturuldu
- [x] LicenseKeyEntry.tsx oluşturuldu
- [x] index.ts'de export edildi
- [ ] Route tanımı ekle (App.tsx)
- [ ] Test et

---

## 🎯 Sonraki Adımlar (Opsiyonel)

### 1. LicenseRouteGuard Ekle
Route-level lisans kontrolü için:
```typescript
<Route path="/admin/*" element={
  <LicenseRouteGuard isAdminRoute>
    <AdminLayout />
  </LicenseRouteGuard>
} />
```

### 2. Lisans Uyarı Bildirimleri
Lisans süresi dolmak üzereyken uyarı göster:
```typescript
// AdminLayout.tsx içinde
useEffect(() => {
  const checkLicenseExpiry = async () => {
    const status = await licenseService.getLicenseStatus();
    if (status.daysRemaining < 30) {
      toast.warning(`Lisansınızın süresi ${status.daysRemaining} gün içinde dolacak!`);
    }
  };
  checkLicenseExpiry();
}, []);
```

### 3. Lisans Geçmişi
Geçmiş lisans kayıtlarını göster (tablo)

---

## 📚 Kaynaklar

- **Backend Analiz:** `wixi.backend/DEVELOPMENT-LICENSE-README.md`
- **Karşılaştırma:** `wixi.backend/WORKLINES-LICENSE-COMPARISON.md`
- **Worklines Referans:** `C:\PROJECTS\wixi-Worklines\docs\LICENSE-MANAGEMENT-SYSTEM.md`

---

## ✨ Özet

✅ **LicenseService.ts** - API çağrıları hazır
✅ **LicenseKeyEntry.tsx** - UI hazır
✅ **SQL Scripts** - Backend hazır
⏳ **Route Tanımı** - Eklenmeli
⏳ **Test** - Yapılmalı

**Kalan İşlem:** Sadece route ekle ve test et! 🚀

