using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Commands.UpdateTenantPaymentSettings;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class TenantPaymentSettingsRepository : ITenantPaymentSettingsRepository
{
    private readonly WixiCoreDbContext _masterDb;
    private readonly IPaymentKeyProtector _protector;

    private const string EnsureTableSql = """
        IF NOT EXISTS (SELECT 1 FROM sysobjects WHERE name='WIXI_EC_PAYMENT_SETTINGS' AND xtype='U')
        CREATE TABLE WIXI_EC_PAYMENT_SETTINGS (
            Id                  UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
            ActiveGateway       NVARCHAR(30)     NOT NULL DEFAULT 'platform_default',
            StripeSecretKey     NVARCHAR(1000)   NULL,
            StripePublishableKey NVARCHAR(1000)  NULL,
            StripeWebhookSecret NVARCHAR(1000)   NULL,
            IyzipayApiKey       NVARCHAR(1000)   NULL,
            IyzipaySecretKey    NVARCHAR(1000)   NULL,
            IyzipayBaseUrl      NVARCHAR(300)    NOT NULL DEFAULT 'https://sandbox-api.iyzipay.com',
            CreatedAt           DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
            UpdatedAt           DATETIME2        NULL
        )
        """;

    public TenantPaymentSettingsRepository(
        WixiCoreDbContext masterDb,
        IPaymentKeyProtector protector)
    {
        _masterDb = masterDb;
        _protector = protector;
    }

    public async Task<TenantPaymentSettingsDto> GetAsync(Guid tenantId, CancellationToken ct = default)
    {
        var connStr = await GetConnectionStringAsync(tenantId, ct);
        if (connStr is null) return DefaultDto();

        try
        {
            await using var ctx = new TenantPaymentDbContext(connStr);
            await ctx.Database.ExecuteSqlRawAsync(EnsureTableSql, ct);

            var s = await ctx.PaymentSettings.FirstOrDefaultAsync(ct);
            return s is null ? DefaultDto() : MapToDto(s);
        }
        catch
        {
            return DefaultDto();
        }
    }

    public async Task UpsertAsync(Guid tenantId, UpdateTenantPaymentSettingsCommand cmd, CancellationToken ct = default)
    {
        var connStr = await GetConnectionStringAsync(tenantId, ct)
            ?? throw new InvalidOperationException($"Tenant {tenantId} bulunamadı veya connection string yok.");

        await using var ctx = new TenantPaymentDbContext(connStr);
        await ctx.Database.ExecuteSqlRawAsync(EnsureTableSql, ct);

        var setting = await ctx.PaymentSettings.FirstOrDefaultAsync(ct);

        if (setting is null)
        {
            setting = new WixiTenantPaymentSetting();
            ctx.PaymentSettings.Add(setting);
        }

        setting.ActiveGateway = cmd.ActiveGateway;
        setting.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(cmd.StripeSecretKey))
            setting.StripeSecretKey = _protector.Protect(cmd.StripeSecretKey);

        if (!string.IsNullOrWhiteSpace(cmd.StripePublishableKey))
            setting.StripePublishableKey = _protector.Protect(cmd.StripePublishableKey);

        if (!string.IsNullOrWhiteSpace(cmd.StripeWebhookSecret))
            setting.StripeWebhookSecret = _protector.Protect(cmd.StripeWebhookSecret);

        if (!string.IsNullOrWhiteSpace(cmd.IyzipayApiKey))
            setting.IyzipayApiKey = _protector.Protect(cmd.IyzipayApiKey);

        if (!string.IsNullOrWhiteSpace(cmd.IyzipaySecretKey))
            setting.IyzipaySecretKey = _protector.Protect(cmd.IyzipaySecretKey);

        if (!string.IsNullOrWhiteSpace(cmd.IyzipayBaseUrl))
            setting.IyzipayBaseUrl = cmd.IyzipayBaseUrl;

        await ctx.SaveChangesAsync(ct);
    }

    public async Task<(string? ApiKey, string? SecretKey, string? BaseUrl, string ActiveGateway)>
        GetRawIyzipayAsync(Guid tenantId, CancellationToken ct = default)
    {
        var connStr = await GetConnectionStringAsync(tenantId, ct);
        if (connStr is null) return (null, null, null, "platform_default");

        try
        {
            await using var ctx = new TenantPaymentDbContext(connStr);
            var s = await ctx.PaymentSettings.FirstOrDefaultAsync(ct);
            if (s is null) return (null, null, null, "platform_default");

            return (
                _protector.Unprotect(s.IyzipayApiKey),
                _protector.Unprotect(s.IyzipaySecretKey),
                s.IyzipayBaseUrl,
                s.ActiveGateway
            );
        }
        catch
        {
            return (null, null, null, "platform_default");
        }
    }

    public async Task<(string? SecretKey, string? PublishableKey, string? WebhookSecret, string ActiveGateway)>
        GetRawStripeAsync(Guid tenantId, CancellationToken ct = default)
    {
        var connStr = await GetConnectionStringAsync(tenantId, ct);
        if (connStr is null) return (null, null, null, "platform_default");

        try
        {
            await using var ctx = new TenantPaymentDbContext(connStr);
            var s = await ctx.PaymentSettings.FirstOrDefaultAsync(ct);
            if (s is null) return (null, null, null, "platform_default");

            return (
                _protector.Unprotect(s.StripeSecretKey),
                _protector.Unprotect(s.StripePublishableKey),
                _protector.Unprotect(s.StripeWebhookSecret),
                s.ActiveGateway
            );
        }
        catch
        {
            return (null, null, null, "platform_default");
        }
    }

    private async Task<string?> GetConnectionStringAsync(Guid tenantId, CancellationToken ct)
    {
        var tenant = await _masterDb.Tenants
            .AsNoTracking()
            .Where(t => t.Id == tenantId && !t.IsDeleted)
            .Select(t => new { t.ConnectionString })
            .FirstOrDefaultAsync(ct);

        return tenant?.ConnectionString;
    }

    private TenantPaymentSettingsDto MapToDto(WixiTenantPaymentSetting s) =>
        new(
            ActiveGateway: s.ActiveGateway,
            HasStripeSecretKey: s.StripeSecretKey != null,
            StripeSecretKeyHint: MaskKey(_protector.Unprotect(s.StripeSecretKey)),
            StripePublishableKey: _protector.Unprotect(s.StripePublishableKey),
            HasStripeWebhookSecret: s.StripeWebhookSecret != null,
            StripeWebhookSecretHint: MaskKey(_protector.Unprotect(s.StripeWebhookSecret)),
            HasIyzipayApiKey: s.IyzipayApiKey != null,
            IyzipayApiKeyHint: MaskKey(_protector.Unprotect(s.IyzipayApiKey)),
            HasIyzipaySecretKey: s.IyzipaySecretKey != null,
            IyzipaySecretKeyHint: MaskKey(_protector.Unprotect(s.IyzipaySecretKey)),
            IyzipayBaseUrl: s.IyzipayBaseUrl
        );

    private static TenantPaymentSettingsDto DefaultDto() => new(
        ActiveGateway: "platform_default",
        HasStripeSecretKey: false, StripeSecretKeyHint: null,
        StripePublishableKey: null,
        HasStripeWebhookSecret: false, StripeWebhookSecretHint: null,
        HasIyzipayApiKey: false, IyzipayApiKeyHint: null,
        HasIyzipaySecretKey: false, IyzipaySecretKeyHint: null,
        IyzipayBaseUrl: "https://sandbox-api.iyzipay.com"
    );

    private static string? MaskKey(string? value)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= 4) return null;
        return $"{"*".PadRight(value.Length - 4, '*')}{value[^4..]}";
    }
}
