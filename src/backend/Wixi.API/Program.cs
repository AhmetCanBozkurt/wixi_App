using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;
using Wixi.Modules.Core.Application.Auth.Services;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Services;
using Wixi.API.Extensions;
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
builder.Services.Configure<MailOptions>(builder.Configuration.GetSection(MailOptions.SectionName));
builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection(StripeOptions.SectionName));

builder.Services.AddWixiCors(builder.Configuration);
builder.Services.AddWixiRateLimiting(builder.Configuration);
builder.Services.AddWixiAuth(builder.Configuration);

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

// CQRS / MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(typeof(Wixi.Modules.Core.Application.Auth.Commands.Login.LoginCommand).Assembly));
builder.Services.AddWixiValidation();

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
builder.Services.AddHostedService<Wixi.Modules.Core.Infrastructure.Services.TcmbSyncBackgroundWorker>();
builder.Services.AddHostedService<Wixi.Modules.Core.Infrastructure.Services.SubscriptionExpiryBackgroundWorker>();

// Stripe
builder.Services.AddScoped<Wixi.Modules.Core.Application.Common.Interfaces.IStripeService, Wixi.Modules.Core.Infrastructure.Services.StripeService>();

// TCMB Exchange Rate Service
builder.Services.AddHttpClient<Wixi.Modules.Core.Application.Common.Interfaces.ITcmbExchangeRateService,
    Wixi.Modules.Core.Infrastructure.Services.TcmbExchangeRateService>(c =>
{
    c.BaseAddress = new Uri("https://www.tcmb.gov.tr/");
    c.Timeout = TimeSpan.FromSeconds(15);
});

// ── ECommerce Modülü ─────────────────────────────────────────────
builder.Services.AddECommerceModule(builder.Configuration);

builder.Services.AddHealthChecks()
    .AddCheck("database", () =>
    {
        try
        {
            using var conn = new Microsoft.Data.SqlClient.SqlConnection(
                builder.Configuration.GetConnectionString("DefaultConnection"));
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT 1";
            cmd.ExecuteScalar();
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Unhealthy(ex.Message);
        }
    });

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseWixiMiddleware();

// Localization Middleware
var supportedCultures = new[] { "tr-TR", "en-US", "de-DE", "fr-FR", "es-ES", "ru-RU", "it-IT", "pt-PT" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures)
    .AddSupportedUICultures(supportedCultures);

localizationOptions.RequestCultureProviders.Insert(0, new Microsoft.AspNetCore.Localization.AcceptLanguageHeaderRequestCultureProvider());

app.UseRequestLocalization(localizationOptions);

// ── ECommerce Tenant Middleware ───────────────────────────────────
app.UseECommerceModule();

// ── ECommerce Master & Tenant DB Migrations ───────────────────────
await app.MigrateECommerceMasterDbAsync();
await app.MigrateAllTenantDbsAsync();

app.MapHealthChecks("/health");
app.MapControllers();

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}
