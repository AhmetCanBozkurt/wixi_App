using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Wixi.Shared.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Wixi.Modules.Core.Application.Auth.Services;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Services;
using Wixi.Modules.ECommerce;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day, outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<AuthSecurityOptions>(builder.Configuration.GetSection(AuthSecurityOptions.SectionName));
builder.Services.Configure<AppCorsOptions>(builder.Configuration.GetSection(AppCorsOptions.SectionName));
builder.Services.Configure<AuthRateLimitOptions>(builder.Configuration.GetSection(AuthRateLimitOptions.SectionName));

var corsOrigins = builder.Configuration.GetSection(AppCorsOptions.SectionName).Get<AppCorsOptions>()?.Origins;
if (corsOrigins is not { Length: > 0 })
{
    corsOrigins =
    [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ];
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<IRefreshTokenCookieService, RefreshTokenCookieService>();
builder.Services.AddSingleton<IOtpPepperProvider, OtpPepperProvider>();

var rateOpts = builder.Configuration.GetSection(AuthRateLimitOptions.SectionName).Get<AuthRateLimitOptions>() ?? new AuthRateLimitOptions();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Çok fazla istek. Lütfen kısa bir süre sonra tekrar deneyin." },
            cancellationToken: token);
    };

    void AddFixedWindow(string name, int permitPerMinute)
    {
        options.AddPolicy(name, httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = permitPerMinute,
                    Window = TimeSpan.FromMinutes(1),
                    AutoReplenishment = true,
                    QueueLimit = 0
                }));
    }

    AddFixedWindow("auth_login", rateOpts.LoginPermitPerMinute);
    AddFixedWindow("auth_verify_2fa", rateOpts.VerifyTwoFactorPermitPerMinute);
    AddFixedWindow("auth_resend_2fa", rateOpts.ResendTwoFactorPermitPerMinute);
    AddFixedWindow("auth_refresh", rateOpts.RefreshPermitPerMinute);
    AddFixedWindow("auth_forgot_password", rateOpts.ForgotPasswordPermitPerMinute);
    AddFixedWindow("auth_reset_password", rateOpts.ResetPasswordPermitPerMinute);
    AddFixedWindow("auth_register", rateOpts.RegisterPermitPerMinute);
    AddFixedWindow("auth_logout_all", rateOpts.LogoutAllPermitPerMinute);
});

// CQRS / MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(Wixi.Modules.Core.Application.Auth.Commands.Login.LoginCommand).Assembly));

// Configure Enterprise Database
builder.Services.AddDbContext<WixiCoreDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Services
builder.Services.AddScoped<Wixi.Modules.Core.Application.Common.Interfaces.ICurrentUserService, Wixi.Modules.Core.Infrastructure.Services.CurrentUserService>();
builder.Services.AddSingleton<Wixi.Modules.Core.Application.Common.Interfaces.IMailTemplateEngine, Wixi.Modules.Core.Infrastructure.Services.MailTemplateEngine>();
builder.Services.AddScoped<Wixi.Modules.Core.Application.Common.Interfaces.IMailService, Wixi.Modules.Core.Infrastructure.Services.MailService>();
builder.Services.AddSingleton<Wixi.Modules.Core.Application.Common.Interfaces.IMailQueue, Wixi.Modules.Core.Application.Common.Interfaces.MailQueue>();
builder.Services.AddScoped<Wixi.Modules.Core.Application.Common.Interfaces.IFileStorageService, Wixi.Modules.Core.Infrastructure.Services.LocalFileStorageService>();

// Background Workers
builder.Services.AddHostedService<Wixi.Modules.Core.Infrastructure.Services.MailingBackgroundWorker>();

// ── ECommerce Modülü ─────────────────────────────────────────────
builder.Services.AddECommerceModule(builder.Configuration);

// Mail Configuration
builder.Services.Configure<MailOptions>(builder.Configuration.GetSection(MailOptions.SectionName));

// Configure Identity
builder.Services.AddIdentity<WixiUser, WixiRole>(options => {
    options.User.RequireUniqueEmail = true;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<WixiCoreDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>();
var key = Encoding.ASCII.GetBytes(jwtOptions?.SecretKey ?? "DefaultSecretKeyPlaceholder12345");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtOptions?.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtOptions?.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Seed Default Admin (Development or Safe Mode)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        var db = services.GetRequiredService<WixiCoreDbContext>();
        await db.Database.ExecuteSqlRawAsync(@"
IF OBJECT_ID(N'dbo.WIXI_2FA_CODES', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WIXI_2FA_CODES (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NOT NULL,
        CodeHash NVARCHAR(128) NOT NULL,
        CodeSalt NVARCHAR(64) NOT NULL,
        SessionToken NVARCHAR(100) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        IsUsed BIT NOT NULL,
        AttemptCount INT NOT NULL,
        CreatedAt DATETIME2 NOT NULL,
        LastResendAtUtc DATETIME2 NULL
    );
    CREATE UNIQUE INDEX IX_WIXI_2FA_CODES_SessionToken ON dbo.WIXI_2FA_CODES(SessionToken);
END
ELSE
BEGIN
    IF COL_LENGTH('dbo.WIXI_2FA_CODES','Code') IS NOT NULL
    BEGIN
        DELETE FROM dbo.WIXI_2FA_CODES;
        ALTER TABLE dbo.WIXI_2FA_CODES DROP COLUMN Code;
    END
    IF COL_LENGTH('dbo.WIXI_2FA_CODES','CodeHash') IS NULL
        ALTER TABLE dbo.WIXI_2FA_CODES ADD CodeHash NVARCHAR(128) NULL;
    IF COL_LENGTH('dbo.WIXI_2FA_CODES','CodeSalt') IS NULL
        ALTER TABLE dbo.WIXI_2FA_CODES ADD CodeSalt NVARCHAR(64) NULL;
    IF COL_LENGTH('dbo.WIXI_2FA_CODES','LastResendAtUtc') IS NULL
        ALTER TABLE dbo.WIXI_2FA_CODES ADD LastResendAtUtc DATETIME2 NULL;
    UPDATE dbo.WIXI_2FA_CODES SET CodeHash = N'', CodeSalt = N'' WHERE CodeHash IS NULL OR CodeSalt IS NULL;
    ALTER TABLE dbo.WIXI_2FA_CODES ALTER COLUMN CodeHash NVARCHAR(128) NOT NULL;
    ALTER TABLE dbo.WIXI_2FA_CODES ALTER COLUMN CodeSalt NVARCHAR(64) NOT NULL;
END

IF OBJECT_ID(N'dbo.WIXI_REFRESH_TOKENS', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WIXI_REFRESH_TOKENS (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NOT NULL,
        Token NVARCHAR(100) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        IsRevoked BIT NOT NULL,
        IpAddress NVARCHAR(64) NULL,
        UserAgent NVARCHAR(512) NULL,
        CreatedAt DATETIME2 NOT NULL
    );
    CREATE UNIQUE INDEX IX_WIXI_REFRESH_TOKENS_Token ON dbo.WIXI_REFRESH_TOKENS(Token);
END
");

        await SeedData.InitializeAsync(services);
    } catch (Exception ex) {
        Console.WriteLine($"An error occurred seeding the DB: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ── Global Request Logger ─────────────────────────────────────────
app.Use(async (context, next) =>
{
    Console.WriteLine($"[GLOBAL LOG] {context.Request.Method} {context.Request.Path}");
    await next();
});

app.UseStaticFiles();
// app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

// ── ECommerce Tenant Middleware ───────────────────────────────────
// Auth ve Authorization'dan sonra gelmelidir
app.UseECommerceModule();

// Localization Middleware
var supportedCultures = new[] { "tr-TR", "en-US", "de-DE", "fr-FR", "es-ES", "ru-RU", "it-IT", "pt-PT" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

localizationOptions.RequestCultureProviders.Insert(0, new Microsoft.AspNetCore.Localization.AcceptLanguageHeaderRequestCultureProvider());

app.UseRequestLocalization(localizationOptions);

// ── ECommerce Master & Tenant DB Migrations ───────────────────────
await app.MigrateECommerceMasterDbAsync();
await app.MigrateAllTenantDbsAsync();

app.MapControllers();

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}
