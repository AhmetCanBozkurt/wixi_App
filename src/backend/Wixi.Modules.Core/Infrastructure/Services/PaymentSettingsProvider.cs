using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class PaymentSettingsProvider : IPaymentSettingsProvider
{
    private readonly WixiCoreDbContext _db;
    private readonly IPaymentKeyProtector _protector;
    private readonly IOptions<StripeOptions> _stripeOptions;
    private readonly IOptions<IyzipayOptions> _iyzipayOptions;
    private readonly ITenantPaymentSettingsRepository _tenantRepo;

    // Request-scoped cache — DB'ye yalnızca bir kez gidilir
    private WixiPlatformPaymentSetting? _cached;
    private bool _loaded;

    public PaymentSettingsProvider(
        WixiCoreDbContext db,
        IPaymentKeyProtector protector,
        IOptions<StripeOptions> stripeOptions,
        IOptions<IyzipayOptions> iyzipayOptions,
        ITenantPaymentSettingsRepository tenantRepo)
    {
        _db = db;
        _protector = protector;
        _stripeOptions = stripeOptions;
        _iyzipayOptions = iyzipayOptions;
        _tenantRepo = tenantRepo;
    }

    public async Task<StripeOptions> GetStripeOptionsAsync(CancellationToken ct = default)
    {
        var setting = await GetSettingAsync(ct);

        if (setting?.StripeSecretKey != null)
        {
            return new StripeOptions
            {
                SecretKey = _protector.Unprotect(setting.StripeSecretKey) ?? string.Empty,
                PublishableKey = _protector.Unprotect(setting.StripePublishableKey) ?? string.Empty,
                WebhookSecret = _protector.Unprotect(setting.StripeWebhookSecret) ?? string.Empty
            };
        }

        return _stripeOptions.Value;
    }

    public async Task<IyzipayOptions> GetIyzipayOptionsAsync(CancellationToken ct = default)
    {
        var setting = await GetSettingAsync(ct);

        if (setting?.IyzipayApiKey != null)
        {
            return new IyzipayOptions
            {
                ApiKey = _protector.Unprotect(setting.IyzipayApiKey) ?? string.Empty,
                SecretKey = _protector.Unprotect(setting.IyzipaySecretKey) ?? string.Empty,
                BaseUrl = setting.IyzipayBaseUrl
            };
        }

        return _iyzipayOptions.Value;
    }

    public async Task<IyzipayOptions> GetIyzipayOptionsForTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        // Tenant'ın kendi DB'sinden okur — Wixi master DB'sinde bu veri yoktur
        var (apiKey, secretKey, baseUrl, gateway) =
            await ((TenantPaymentSettingsRepository)_tenantRepo).GetRawIyzipayAsync(tenantId, ct);

        if (apiKey != null && gateway != "platform_default")
        {
            return new IyzipayOptions
            {
                ApiKey = apiKey,
                SecretKey = secretKey ?? string.Empty,
                BaseUrl = baseUrl ?? _iyzipayOptions.Value.BaseUrl
            };
        }

        return await GetIyzipayOptionsAsync(ct);
    }

    public async Task<StripeOptions> GetStripeOptionsForTenantAsync(Guid tenantId, CancellationToken ct = default)
    {
        var (secretKey, publishableKey, webhookSecret, gateway) =
            await ((TenantPaymentSettingsRepository)_tenantRepo).GetRawStripeAsync(tenantId, ct);

        if (secretKey != null && gateway != "platform_default")
        {
            return new StripeOptions
            {
                SecretKey = secretKey,
                PublishableKey = publishableKey ?? string.Empty,
                WebhookSecret = webhookSecret ?? string.Empty
            };
        }

        return await GetStripeOptionsAsync(ct);
    }

    private async Task<WixiPlatformPaymentSetting?> GetSettingAsync(CancellationToken ct)
    {
        if (_loaded) return _cached;
        _cached = await _db.PlatformPaymentSettings.FirstOrDefaultAsync(ct);
        _loaded = true;
        return _cached;
    }
}
