using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.PaymentSettings.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;
using Microsoft.Extensions.Options;

namespace Wixi.Modules.Core.Application.PaymentSettings.Queries.GetPlatformPaymentSettings;

public class GetPlatformPaymentSettingsQueryHandler
    : IRequestHandler<GetPlatformPaymentSettingsQuery, PlatformPaymentSettingsDto>
{
    private readonly WixiCoreDbContext _db;
    private readonly IPaymentKeyProtector _protector;
    private readonly IOptions<IyzipayOptions> _iyzipayOptions;

    public GetPlatformPaymentSettingsQueryHandler(
        WixiCoreDbContext db,
        IPaymentKeyProtector protector,
        IOptions<IyzipayOptions> iyzipayOptions)
    {
        _db = db;
        _protector = protector;
        _iyzipayOptions = iyzipayOptions;
    }

    public async Task<PlatformPaymentSettingsDto> Handle(
        GetPlatformPaymentSettingsQuery request, CancellationToken ct)
    {
        var setting = await _db.PlatformPaymentSettings.FirstOrDefaultAsync(ct);

        if (setting is null)
        {
            return new PlatformPaymentSettingsDto(
                HasStripeSecretKey: false, StripeSecretKeyHint: null,
                StripePublishableKey: null,
                HasStripeWebhookSecret: false, StripeWebhookSecretHint: null,
                HasIyzipayApiKey: false, IyzipayApiKeyHint: null,
                HasIyzipaySecretKey: false, IyzipaySecretKeyHint: null,
                IyzipayBaseUrl: _iyzipayOptions.Value.BaseUrl);
        }

        return new PlatformPaymentSettingsDto(
            HasStripeSecretKey: setting.StripeSecretKey != null,
            StripeSecretKeyHint: MaskKey(_protector.Unprotect(setting.StripeSecretKey)),
            StripePublishableKey: _protector.Unprotect(setting.StripePublishableKey),
            HasStripeWebhookSecret: setting.StripeWebhookSecret != null,
            StripeWebhookSecretHint: MaskKey(_protector.Unprotect(setting.StripeWebhookSecret)),
            HasIyzipayApiKey: setting.IyzipayApiKey != null,
            IyzipayApiKeyHint: MaskKey(_protector.Unprotect(setting.IyzipayApiKey)),
            HasIyzipaySecretKey: setting.IyzipaySecretKey != null,
            IyzipaySecretKeyHint: MaskKey(_protector.Unprotect(setting.IyzipaySecretKey)),
            IyzipayBaseUrl: setting.IyzipayBaseUrl);
    }

    // Son 4 karakter görünür, geri kalan maskelenir
    private static string? MaskKey(string? value)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= 4) return null;
        return $"{"*".PadRight(value.Length - 4, '*')}{value[^4..]}";
    }
}
