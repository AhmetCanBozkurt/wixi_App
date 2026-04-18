# Auth Özellikleri: 2FA, Remember Me, Şifremi Unuttum

Branch: `feature/auth-2fa-remember-forgot`

## Kapsam

Üç bağımsız ama birbirine bağlı auth özelliği aynı branch'te geliştirilecek:

1. **2FA (Two-Factor Authentication)** — TOTP veya e-posta OTP ile ikinci faktör doğrulama
2. **Remember Me** — HTTP-Only Secure Refresh Token cookie ile 30 günlük oturum
3. **Şifremi Unuttum / Sıfırla** — Token tabanlı e-posta akışı

---

## Mevcut Durum

- `WixiUser : IdentityUser<Guid>` → `TwoFactorEnabled` alanı **ASP.NET Identity'de zaten var**
- Login handler mevcut, JWT üretiyor ama **2FA kontrolü yok**
- `RememberMe`, `RefreshToken` mekanizması **yok**
- Şifre sıfırlama endpoint'i **yok**
- Mail servisi **hazır** (`IMailService`, `TWO_FACTOR_AUTH` şablonu DB'de var)

---

## Proposed Changes

### Backend

---

#### Faz 1 — 2FA (E-posta OTP)

> `IdentityUser.TwoFactorEnabled` kullanılıyor, TOTP yerine mail OTP tercih ediliyor (kurulum gerektirmez).

##### [MODIFY] LoginCommandHandler.cs
- Kullanıcı giriş yaptığında `TwoFactorEnabled` kontrolü
- 2FA aktifse: JWT üretilmez, OTP üretilip mail gönderilir, `requiresTwoFactor: true` + `twoFactorToken: <temp_token>` döner

##### [NEW] `Application/Auth/Commands/VerifyTwoFactor/VerifyTwoFactorCommand.cs`
- `TwoFactorToken` + `OtpCode` alır
- OTP doğruysa gerçek JWT üretir ve döner
- Yanlışsa hata döner (max 3 deneme)

##### [NEW] `Domain/Entities/WixiTwoFactorCode.cs`
- `UserId`, `Code`, `ExpiresAt`, `IsUsed` alanları
- DB migrasyonu: `WIXI_2FA_CODES`

##### [MODIFY] AuthController.cs
- `POST /api/v1/auth/verify-2fa` endpoint eklenir

---

#### Faz 2 — Remember Me (Refresh Token)

##### [NEW] `Domain/Entities/WixiRefreshToken.cs`
- `UserId`, `Token` (Guid), `ExpiresAt`, `IsRevoked`, `IpAddress`
- DB migrasyonu: `WIXI_REFRESH_TOKENS`

##### [MODIFY] LoginCommandHandler.cs
- `RememberMe: true` gelirse: Refresh Token üretilir, **HTTP-Only Secure Cookie** olarak set edilir (30 gün)

##### [NEW] `Application/Auth/Commands/RefreshToken/RefreshTokenCommand.cs`
- Cookie'deki token okunur → doğrulanır → yeni JWT üretilir

##### [MODIFY] AuthController.cs
- `POST /api/v1/auth/refresh` endpoint
- `POST /api/v1/auth/logout` — cookie silinir, token revoke edilir

---

#### Faz 3 — Şifremi Unuttum / Sıfırla

##### [NEW] `Application/Auth/Commands/ForgotPassword/ForgotPasswordCommand.cs`
- Email alır → Identity'nin `GeneratePasswordResetTokenAsync` ile token üretir
- `FORGOT_PASSWORD` mail şablonuyla reset link maili gönderir

##### [NEW] `Application/Auth/Commands/ResetPassword/ResetPasswordCommand.cs`
- `Email`, `Token`, `NewPassword` alır
- Identity `ResetPasswordAsync` çağrılır

##### [MODIFY] AuthController.cs
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

---

### Frontend

---

#### Login Sayfası Güncellemeleri

##### [MODIFY] `LoginPage.tsx`
- "Beni Hatırla" toggle switch eklenir
- API `requiresTwoFactor: true` dönerse → 2FA modal açılır
- "Şifremi Unuttum" linki eklenir

#### [NEW] 2FA Modal Bileşeni
- `TwoFactorModal.tsx` — 6 haneli OTP input (kutu kutu)
- Geri sayım (5 dk), "Yeniden Gönder" butonu
- Başarılıysa token store'a yazılır

#### [NEW] Şifremi Unuttum Sayfası
- `/forgot-password` route → e-posta alanı + gönder butonu
- Gönderildikten sonra "Mail kutunuzu kontrol edin" bilgi ekranı

#### [NEW] Şifre Sıfırla Sayfası
- `/reset-password?token=...&email=...` route
- Yeni şifre + Onay şifre alanları
- Başarılıysa login'e yönlendir

---

## Seed Data
- `FORGOT_PASSWORD` mail şablonu eklenecek (zaten DB'de `TWO_FACTOR_AUTH` var)
- Yeni: `FORGOT_PASSWORD` şablonu SeedData'ya eklenir

---

## Verification Plan

| Test | Yöntem |
|------|--------|
| 2FA akışı | Kullanıcıya `TwoFactorEnabled=true` set edip login + OTP doğrulama |
| Remember Me | Login sonrası cookie varlığı, refresh endpoint testi |
| Şifremi Unuttum | Mail gönderimi ve reset link ile şifre değiştirme |

---

## Open Questions

> [!IMPORTANT]
> **2FA Yöntemi:** TOTP (Google Authenticator) mi yoksa **E-posta OTP** mi?
> Mail servisi hazır olduğu için e-posta OTP daha hızlı ve kurulum gerektirmez.
> Onayınız varsa e-posta OTP ile başlıyorum.
