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

    // Request-scoped cache — DB'ye yalnızca bir kez gidilir
    private WixiPlatformPaymentSetting? _cached;
    private bool _loaded;

    public PaymentSettingsProvider(
        WixiCoreDbContext db,
        IPaymentKeyProtector protector,
        IOptions<StripeOptions> stripeOptions,
        IOptions<IyzipayOptions> iyzipayOptions)
    {
        _db = db;
        _protector = protector;
        _stripeOptions = stripeOptions;
        _iyzipayOptions = iyzipayOptions;
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

    private async Task<WixiPlatformPaymentSetting?> GetSettingAsync(CancellationToken ct)
    {
        if (_loaded) return _cached;
        _cached = await _db.PlatformPaymentSettings.FirstOrDefaultAsync(ct);
        _loaded = true;
        return _cached;
    }
}
