# Wixi Platform — Altyapı Analiz Raporu

> İlk Analiz: 2026-05-07  
> Son Güncelleme: 2026-05-07 (Faz 1-2 tamamlandı)  
> Durum işaretleri: ✅ Tamamlandı · 🔴 Kritik · 🟠 Yüksek · 🟡 Orta · 🟢 Düşük

---

## Genel Durum

| Kategori | Toplam | Tamamlanan | Bekleyen |
|---|---|---|---|
| 🔴 Kritik | 2 | 2 | 0 |
| 🟠 Yüksek | 8 | 8 | 0 |
| 🟡 Orta | 9 | 3 | 6 |
| 🟢 Düşük | 4 | 1 | 3 |
| **Toplam** | **23** | **14** | **9** |

---

## 1. Güvenlik

### 1.1 Hassas Veri İfşası ✅ TAMAMLANDI

~~`appsettings.json` dosyasında canlı DB kimlik bilgisi, JWT secret açıkta~~

**Yapılan:** Gerçek değerler `appsettings.Development.json`'a taşındı. `appsettings.json`'da yalnızca placeholder'lar kaldı. `.gitignore`'a `appsettings.Development.json` ve `src/frontend/.env` eklendi.

---

### 1.2 Yetkilendirme Delikleri ✅ TAMAMLANDI

~~Controller'lar `[Authorize]` olmadan açıkta~~

**Yapılan:**
- `UserManagementController` → `[Authorize(Roles = "SuperAdmin,Admin")]`
- `FilesController` → `[Authorize]` aktifleştirildi
- `CurrencyController` → class düzeyinde `[Authorize]`, admin endpointlerine `[Authorize(Roles = "SuperAdmin,Admin")]`

---

### 1.3 CORS Wildcard ✅ TAMAMLANDI

~~`SetIsOriginAllowed(_ => true)` tüm origin'leri kabul ediyordu~~

**Yapılan:** `ServiceExtensions.AddWixiCors()` içinde `WithOrigins(corsOrigins)` ile `appsettings.json → AppCors.Origins` whitelist'i kullanılıyor.

---

### 1.4 HTTPS Zorlaması Eksik — 🟡 Orta

`Program.cs`'de `app.UseHttpsRedirection()` yorum satırı. JWT `RequireHttpsMetadata = false`. Üretimde MITM saldırısına açık.

**Aksiyon:** Deploy öncesi aktifleştirilmeli.

---

### 1.5 Rate Limiting Kapsamı Dar — 🟡 Orta

Auth dışı endpoint'ler (`UserManagement`, `Menu`, `Language`, `Currency`) rate limit'siz.

---

## 2. Validasyon & Hata Yönetimi

### 2.1 FluentValidation ✅ TAMAMLANDI

~~Command handler'larında giriş doğrulaması yoktu~~

**Yapılan:**
- `FluentValidation.DependencyInjectionExtensions 11.11.0` paketi eklendi
- `ValidationBehavior<TRequest, TResponse>` MediatR pipeline behavior yazıldı
- `AddWixiValidation()` ile assembly scan kaydı yapıldı
- Validator'lar: `LoginCommandValidator`, `RegisterCommandValidator`, `CreateCurrencyCommandValidator`

---

### 2.2 Global Exception Handler ✅ TAMAMLANDI

~~Stack trace içeren 500 yanıtları dönebiliyordu~~

**Yapılan:** `MiddlewareExtensions.UseWixiMiddleware()` içinde ProblemDetails formatında `UseExceptionHandler` middleware eklendi. Development ortamında stack trace, production'da genel mesaj döner.

---

### 2.3 API Yanıt Formatı Tutarsız — 🟡 Orta

Endpoint'ler farklı response shape'leri kullanıyor.

**Yapılan:** `Wixi.Shared/Application/ApiResponse<T>` wrapper oluşturuldu. Controller'lara uygulanması sonraki adım.

---

### 2.4 Pagination Tutarsız — 🟢 Düşük

Bazı endpoint'lerde `.Take(100)` sabit sınır var. `PagedResult<T>` her yerde kullanılmıyor.

---

## 3. Veritabanı & EF Core

### 3.1 Global Soft Delete Filter ✅ TAMAMLANDI

~~Silinmiş kayıtlar sorgulara sızabiliyordu~~

**Yapılan:** `WixiCoreDbContext.OnModelCreating()` içinde `IAuditable` implement eden tüm entity'ler için `HasQueryFilter(e => !e.IsDeleted)` dinamik olarak eklendi. 3 adet test ile doğrulandı.

---

### 3.2 Migration Yığılması — 🟢 Düşük

15+ migration, bazıları düzeltme içeriyor. `dotnet ef migrations squash` ile temizlenebilir.

---

### 3.3 Audit Log Transaction Ayrımı — 🟡 Orta

`LogActivityAsync` / `LogSecurityEventAsync` ana işlemden bağımsız `SaveChanges` çağırıyor. Ana kayıt kaydedilip audit log düşerse iz kaybı olabilir.

---

## 4. Test Altyapısı

### 4.1 Test Projesi ✅ TAMAMLANDI

~~Test projesi yoktu, coverage %0~~

**Yapılan:** `src/backend/Wixi.Tests` projesi oluşturuldu, `Wixi.Platform.sln`'a eklendi.

**Paketler:** xUnit 2.9.2, Moq 4.20.72, FluentAssertions 6.12.2, EF Core InMemory 8.0.2, FluentValidation 11.11.0

**Test dosyaları ve geçen test sayısı:**

| Dosya | Kapsam | Test |
|---|---|---|
| `Helpers/WixiDbContextFactory.cs` | InMemory DbContext üretici | — |
| `Validators/LoginCommandValidatorTests.cs` | Email format, password min-length | 5 |
| `Validators/RegisterCommandValidatorTests.cs` | Ad/soyad, email, şifre gücü | 7 |
| `Validators/CreateCurrencyCommandValidatorTests.cs` | Code regex `^[A-Z]{2,10}$`, Unit > 0 | 7 |
| `Commands/SyncTcmbRatesCommandHandlerTests.cs` | Otomatik currency oluşturma, duplicate koruması, tatil günü | 3 |
| `Shared/ApiResponseTests.cs` | `Ok`, `Fail`, `Timestamp` | 3 |
| `Infrastructure/GlobalQueryFilterTests.cs` | Soft delete filter, `IgnoreQueryFilters` karşıt test | 3 |

**Sonuç: 28/28 PASSED ✅**

**Henüz yazılmayan testler (sonraki sprint):**
- Auth handler'ları (Login, Register, 2FA, token refresh)
- Parity / cross-parity hesaplama
- SetBaseCurrency transaction güvenliği
- Integration testleri (gerçek DB ile)

---

## 5. Performans & Ölçeklenebilirlik

### 5.1 Sınırsız Mail Kuyruğu ✅ TAMAMLANDI

~~`Channel.CreateUnbounded<>()` memory leak riski taşıyordu~~

**Yapılan:** `Channel.CreateBounded<>(new BoundedChannelOptions(500) { FullMode = BoundedChannelFullMode.Wait })` ile sınırlandırıldı.

---

### 5.2 Önbellekleme Yok — 🟡 Orta

`Currencies`, `Languages`, `Menus` her request'de DB'den çekiliyor. `IMemoryCache` veya Redis ile cache katmanı eklenebilir.

---

### 5.3 Background Worker Retry Yok — 🟡 Orta

`MailingBackgroundWorker` mail başarısız olursa sadece logluyor. Dead Letter Queue veya retry mekanizması yok.

---

## 6. Frontend

### 6.1 Error Boundary ✅ TAMAMLANDI

~~Herhangi bir render hatası tüm uygulamayı çöküyordu~~

**Yapılan:** `src/frontend/src/app/providers/ErrorBoundary.tsx` oluşturuldu. `App.tsx`'de `<BrowserRouter>` sarmalandı. "Sayfayı Yenile" butonu ve hata mesajı içeriyor.

---

### 6.2 Vite Environment Değişkeni ✅ TAMAMLANDI

~~`baseURL` hardcoded `http://localhost:5182/api/v1` idi~~

**Yapılan:** `src/frontend/.env` (`VITE_API_URL=http://localhost:5182/api/v1`) oluşturuldu. `axiosConfig.ts` artık `import.meta.env.VITE_API_URL ?? fallback` kullanıyor. `.env.example` dokümantasyon için eklendi.

---

### 6.3 Loading/Skeleton State Tutarsızlığı — 🟡 Orta

Bazı sayfalarda spinner var, bazılarında yok. Skeleton ekranlar hiç yok.

---

### 6.4 Token Güvenliği — 🟡 Orta

JWT access token `localStorage`'da. XSS saldırısında çalınabilir.

---

### 6.5 Tip Güvenliği Eksiklikleri — 🟢 Düşük

API response'ları `any` ile cast ediliyor. `src/shared/api/types/` ortak tip katmanı yok.

---

## 7. Loglama

### 7.1 Veritabanı Sink Konfigüre Edilmemiş — 🟡 Orta

`Serilog.Sinks.MSSqlServer` paketi var ama `appsettings.json`'da sink tanımlı değil.

---

### 7.2 Console.WriteLine Debug Kodu ✅ TAMAMLANDI

~~`Program.cs`'de `Console.WriteLine` bazlı request middleware vardı~~

**Yapılan:** Program.cs refaktöründe temizlendi. Tüm loglama Serilog üzerinden geçiyor.

---

## 8. Modülerlik & DI

### 8.1 Program.cs Şişkin ✅ TAMAMLANDI

~~296 satır, tüm DI + middleware inline~~

**Yapılan:**
- `src/backend/Wixi.API/Extensions/ServiceExtensions.cs` → `AddWixiAuth`, `AddWixiCors`, `AddWixiRateLimiting`, `AddWixiValidation`
- `src/backend/Wixi.API/Extensions/MiddlewareExtensions.cs` → `UseWixiMiddleware`
- Program.cs ~80 satıra indi

---

### 8.2 ECommerce Modülü Yorum Satırında — 🟢 Düşük

`Program.cs` ve `App.tsx`'de büyük yorum blokları. Feature flag ile yönetilmeli.

---

## 9. Sağlık Kontrolü

### 9.1 Health Check Endpoint ✅ TAMAMLANDI

~~`/health` endpoint'i yoktu~~

**Yapılan:** `builder.Services.AddHealthChecks()` ile raw SQL ping check (`SELECT 1`) eklendi. `app.MapHealthChecks("/health")` ile yayınlandı. `curl http://localhost:5182/health` → `Healthy`

*Not: `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore 9.0.0` EF Core 8 ile uyumsuzdu. Raw `SqlConnection` check kullanıldı.*

---

## 10. Kalan İş Listesi

| # | Alan | Önem | Efor | Durum |
|---|---|---|---|---|
| 1 | Parity + ConvertAmount query handler testleri | 🟠 Yüksek | Düşük | ✅ 10 test (38 toplam) |
| 2 | Rate limiting global default policy | 🟡 Orta | Düşük | ✅ 300 req/dk/IP GlobalLimiter |
| 3 | Serilog DB sink konfigürasyonu | 🟡 Orta | Düşük | ✅ appsettings.Development.json |
| 4 | Auth handler unit testleri | 🟠 Yüksek | Orta | Bekliyor |
| 5 | Integration test altyapısı | 🟠 Yüksek | Yüksek | Bekliyor |
| 6 | ApiResponse wrapper controller'lara uygulama | 🟡 Orta | Orta | Bekliyor |
| 7 | Önbellekleme katmanı (MemoryCache) | 🟡 Orta | Orta | Bekliyor |
| 8 | Mail worker retry mekanizması | 🟡 Orta | Orta | Bekliyor |
| 9 | Loading/Skeleton state standardizasyonu | 🟡 Orta | Yüksek | Bekliyor |
| 10 | HTTPS zorlaması (deploy öncesi) | 🟡 Orta | Düşük | Bekliyor |
| 11 | Migration squash | 🟢 Düşük | Orta | Bekliyor |
| 12 | Swagger XML dokümantasyonu | 🟢 Düşük | Orta | Bekliyor |
| 13 | Frontend tip güvenliği (`any` temizliği) | 🟢 Düşük | Yüksek | Bekliyor |
| 14 | Audit log transaction güvencesi | 🟡 Orta | Orta | Bekliyor |
