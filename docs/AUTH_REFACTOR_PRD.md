# AUTH & MAILING REFACTOR PRD (Prod-Ready Hardening)

Tarih: 2026-04-18  
Kapsam: `src/backend/Wixi.*` + `src/frontend` auth akışı  
İlgili dokümanlar: `docs/2FAplan.md`, `docs/MAILING_PRD.md`

---

## 1) Amaç

Mevcut auth özellikleri (2FA e‑posta OTP, Remember Me refresh token, Forgot/Reset Password) çalışır durumda. Bu PRD’nin amacı bunları:

- güvenli (abuse/brute force dayanıklı),
- prod uyumlu (cookie/CORS/HTTPS/ortam ayrımı),
- gözlemlenebilir (audit/log standardı),
- bakımı kolay (migration + konfig standardı)

hale getirecek refactor/hardening işlerini tanımlamaktır.

---

## 2) Mevcut Durum Özeti

- **2FA**: Login’de `TwoFactorEnabled` ise OTP mail, `verify-2fa` doğrulama, `resend-2fa` yeniden gönderim, deneme limiti.
- **Remember Me**: `wixi_rt` HttpOnly cookie + DB refresh token; `/refresh` rotation; `/logout` revoke + cookie delete.
- **Forgot/Reset Password**: Token tabanlı reset; mail içeriği görünürlük sorunları için “sağlam HTML” yaklaşımı.
- **Frontend**: `withCredentials` + 401 interceptor ile refresh denemesi; 2FA modal; forgot/reset sayfaları.

---

## 3) Refactor Analizi (Riskler / Eksikler)

### 3.1 Abuse / brute-force
- Login / forgot-password / resend-2fa / verify-2fa için **rate limit** yoksa bot saldırılarına açık kalır.
- OTP deneme limiti var; ama IP bazlı throttling yoksa saldırı yüzeyi büyür.

### 3.2 OTP saklama sertliği
- OTP’nin DB’de **düz metin** tutulması (muhtemel) veri sızıntısında risk yaratır.

### 3.3 Prod ortam uyumu
- Cookie `Secure/SameSite/Domain/Path` ve CORS allowlist ayarları **ortam bazlı** standardize edilmeli.

### 3.4 Mailing PRD ile tutarlılık
- Mailing PRD “admin’den template yönetimi” hedefliyor.
- Auth maillerinde template bypass edilirse, bu bir **ürün kararı** olarak dokümante edilmeli.

### 3.5 Observability
- Audit var ama olay seti ve alanlar (reason/errorCode/correlation) standardize edilirse debug kolaylaşır.

### 3.6 Şema yönetimi
- Runtime SQL ile tablo oluşturma gibi dev shortcut’lar varsa prod’da **EF migrations** kaynak olmalı.

---

## 4) Hedefler (Success Criteria)

- **Güvenlik**: Auth endpointleri abuse’a dayanıklı (429 + cooldown + enumeration koruması).
- **Prod uyumu**: Cookie/CORS davranışı dev/prod’da doğru.
- **Mailing uyumu**: Auth security mailleri için net strateji (template mi, kod mu?).
- **Gözlemlenebilirlik**: Kritik auth olayları tutarlı şekilde audit’leniyor.
- **Bakım**: Migration tabanlı, tekrarlanabilir DB şeması.

---

## 5) Kapsam

### In-scope
- Backend auth hardening/refactor
- Rate limiting / throttling
- OTP hashing
- Cookie/CORS konfigürasyonu (dev/prod)
- Audit/log standardizasyonu
- (Opsiyonel) “tüm cihazlardan çıkış” (global logout)

### Out-of-scope (şimdilik)
- TOTP (Authenticator) entegrasyonu
- Tam mail kuyruğu (MailQueue) ve geniş mailing UI işleri (ayrı PRD/faz)

---

## 6) Ürün Kararları (Netleştirilecek)

### 6.1 Auth mailleri: template mi kod mu?
**Uygulanan karar (2026-04-18):**
- **2FA**: DB şablonu `TWO_FACTOR_AUTH` (operasyonel kolaylık).
- **Password Reset**: güvenlik + e-posta istemci uyumluluğu için **koddan üretilen HTML + düz link** (ForgotPassword handler).
- Diğer modül mailleri: Mailing PRD / DB template yönetimi.

### 6.2 Logout çeşitleri
- Mevcut: logout sadece mevcut refresh token’ı revoke eder.
- Opsiyon: **“Tüm cihazlardan çıkış”** endpoint’i (user’a ait tüm refresh token’lar revoke).

---

## 7) Fonksiyonel Gereksinimler

### 7.1 Rate limit politikaları
- `/auth/login`: IP bazlı limit
- `/auth/forgot-password`: IP + email bazlı limit
- `/auth/resend-2fa`: sessionToken bazlı cooldown
- `/auth/verify-2fa`: IP + sessionToken bazlı limit
- `/auth/refresh`: abuse limit (çok sık refresh denemesini kes)

### 7.2 Forgot-password enumeration koruması
- Kullanıcı var/yok bilgisini sızdırmayan sabit yanıt mesajı.

### 7.3 OTP hashing
- DB’de OTP düz metin tutulmaz; `CodeHash(+salt)` saklanır.

### 7.4 Cookie/CORS ortam standardı
- Cookie options tek bir provider’dan üretilir ve `appsettings.*` üzerinden yönetilir.
- CORS allowlist konfigürasyondan okunur.

### 7.5 Audit olay standardı
En az şu olaylar:
- LOGIN_SUCCESS / LOGIN_FAILED / LOGIN_2FA_REQUIRED
- TWOFA_VERIFY_SUCCESS / TWOFA_VERIFY_FAILED / TWOFA_RESEND
- FORGOT_PASSWORD_REQUEST / RESET_PASSWORD_SUCCESS / RESET_PASSWORD_FAILED
- REFRESH_SUCCESS / REFRESH_FAILED
- LOGOUT

---

## 8) Teknik Yaklaşım (Öneri)

- **Rate limiting**: ASP.NET Core rate limiting middleware ile policy seti.
- **OTP hashing**: SHA-256 + per-record salt veya HMAC (secret key ile). (Tercih: HMAC, tek secret yönetimi.)
- **CookieOptions Provider**: Refresh cookie ayarlarını tek noktaya topla.
- **Migrations**: Auth tabloları migration ile yönetilsin; runtime create varsa kaldır.

---

## 9) Task List (Fazlara Bölünmüş)

### Faz A — Abuse Koruması
- [x] Rate limiting middleware + policies
- [x] Forgot-password enumeration koruması
- [x] Resend-2fa backend cooldown enforcement

### Faz B — OTP/Token Sertliği
- [x] OTP hashing + migration planı
- [ ] Refresh replay tespiti (opsiyonel) + incident stratejisi

### Faz C — Prod uyumu
- [x] Cookie options konfigürasyonlaştırma (dev/prod)
- [x] CORS allowlist’i konfigürasyondan yönetme

### Faz D — Observability
- [x] Audit event standardizasyonu + reason/errorCode seti

### Faz E — Security mail stratejisi
- [x] “Auth security mails” policy (template vs code) kararını dokümante et
- [ ] Eğer template’e dönülecekse: ultra-sade template + plain link zorunluluğu

### Faz F — (Opsiyonel) Global Logout
- [x] “Tüm cihazlardan çıkış” endpoint’i
- [x] Frontend: settings veya profil ekranına buton

---

## 10) Kabul Kriterleri

- **Rate limit**: limit aşımında 429 dönüyor ve sistem stabil.
- **OTP**: DB’de düz OTP yok; verify akışı çalışıyor; eski kayıtlar için geçiş planı var.
- **Forgot-password**: kullanıcı var/yok sızdırmıyor.
- **Cookie/CORS**: dev ve prod ortamında refresh cookie beklenen şekilde çalışıyor.
- **Audit**: kritik auth olayları tutarlı şekilde kaydediliyor.

---

## 11) Test / Doğrulama Planı (Minimal)

- 2FA: yanlış OTP (3 deneme) + doğru OTP
- Resend-2FA: cooldown + rate limit
- Remember Me: refresh rotation + logout sonrası refresh başarısızlığı
- Forgot/Reset: token ile reset + hatalı token senaryosu
- Rate limit: ardışık isteklerde 429 doğrulaması

