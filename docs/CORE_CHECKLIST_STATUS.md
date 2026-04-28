# Core Checklist Durum Özeti (Apr 2026)

Bu doküman, “modüllerden önce” Core katmanında beklenen temel konular için **mevcut durumu** özetler.

Durum etiketleri:
- ✅ **Yapıldı**
- 🟡 **Kısmi / İyileştirilebilir**
- ⛔ **Eksik / Sırada**

---

## Mimari & Yapı

- 🟡 **Katman sınırları**: `Wixi.Shared` (cross-cutting), `Wixi.Modules.Core` (iş kuralları), `Wixi.API` (composition root) mevcut.  
  - İyileştirme: Modül bazlı `Add<Module>()` kayıt standardı netleştirilebilir.
- ✅ **Options pattern**: Güvenlik / CORS / rate limit ayarları için `IOptions<T>` kullanımı eklendi.

---

## API Sözleşmesi & Hata Yönetimi

- 🟡 **Response standardı**: Birçok endpoint ` { items: [] } ` ve `{ success: true }` şeklinde dönüyor.
  - İyileştirme: Tüm API’lerde tek format ve tek error şeması (ProblemDetails) standardize edilmeli.
- ⛔ **Global exception middleware**: Merkezi `ProblemDetails` üreten global middleware henüz net değil / tekilleştirilmedi.
- 🟡 **Validation pipeline**: Bazı doğrulamalar handler içinde var; MediatR pipeline/FluentValidation standardı kesinleştirilmeli.

---

## Auth & Güvenlik

- ✅ **2FA (email OTP)**: OTP hash + salt (pepper destekli) ile saklama, attempt limit, cooldown, resend akışı var.
- ✅ **Remember Me / Refresh Token**: DB tabanlı refresh token + cookie (HttpOnly/Secure/SameSite vb.) + rotation mevcut.
- ✅ **Forgot/Reset Password**: Token bazlı akış, robust HTML email (buton + düz link) ve enumeration protection ile.
- 🟡 **Cookie/CORS**: Credentials destekli CORS ve cookie seçenekleri config’ten geliyor.
  - İyileştirme: env bazlı (dev/stage/prod) “Secure / SameSite / Domain” netleştirme + dokümantasyon.
- ✅ **Rate limiting**: Auth endpoint’leri için rate limit policy’leri eklendi ve attribute ile bağlandı.
- 🟡 **Replay detection**: Refresh token replay tespiti (opsiyonel) tam değil / ileri seviye.

---

## User Management / Admin (Core’a yakın kritikler)

- ✅ **Role CRUD + Assignment**: Role yönetimi ve kullanıcı rol atama var.
  - ✅ `SuperAdmin` sistem rolü filtreleniyor / korunuyor (silme ve görünürlük kısıtları).
- ✅ **User menu import (seçmeli)**:
  - Kaynak kullanıcı menüsünden **branch/subtree seçip** hedefe import.
  - UI: seçim listesi ikonlu + modern modal, “replace” opsiyonu.

---

## Mailing / SMTP (Core & Operasyon)

- ✅ **SMTP ayarlarını çekme**:
  - DB’de aktif yoksa `appsettings` fallback dönüyor (şifre maskeli).
  - UI `{}` dönse bile “takılı kalmıyor”, state hydrate ediliyor.
- ✅ **SMTP kaydetme**:
  - UI tarafında **boş şifre gönderilmiyor** (mevcut şifrenin `""` ile ezilmesi engellendi).
- ✅ **Template test (değişkenli)**:
  - Şablondaki `{{variable}}` alanlarını yakalayan modal ile değerleri sorup backend’e gönderme.

---

## Data Katmanı & Migration

- 🟡 **EF migrations**: Migration dosyaları mevcut.
- ⛔ **Migration tek kaynak**:
  - Şu an `Program.cs` içinde runtime SQL ile tablo/kolon create/alter yaklaşımları var.
  - Hedef: Bunları kaldırıp **tamamen EF migration** ile yönetmek (prod için kritik).

---

## Background / Worker

- ✅ **Mailing background worker**: Worker başlangıcı log’lanıyor.
- 🟡 **Retry/backoff/DLQ**: Retry stratejisi, backoff ve dead-letter gibi opsiyonlar henüz net değil.

---

## Observability & Operasyon

- 🟡 **Audit logging**: Auth akışında güvenlik event log’ları mevcut.
  - İyileştirme: CorrelationId, merkezi audit schema, filtreleme/pagination.
- ⛔ **Health checks**: DB/SMTP için health endpoint standardı eklenebilir.
- ⛔ **CI pipeline**: Build/test/lint pipeline (GitHub Actions vb.) net değil / eklenebilir.

---

## Önerilen Sıradaki 3 Adım (en yüksek değer)

1) **Migration tek kaynak**: `Program.cs` runtime SQL kaldır → yalnız migrations.  
2) **Global exception + validation standardı**: ProblemDetails + MediatR validation pipeline.  
3) **Health checks + temel CI**: `GET /health` (DB/SMTP) + pipeline.

