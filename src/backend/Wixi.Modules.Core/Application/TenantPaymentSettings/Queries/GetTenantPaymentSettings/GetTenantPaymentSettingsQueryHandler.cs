using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Queries.GetTenantPaymentSettings;

public class GetTenantPaymentSettingsQueryHandler
    : IRequestHandler<GetTenantPaymentSettingsQuery, TenantPaymentSettingsDto>
{
    private readonly WixiCoreDbContext _db;
    private readonly IPaymentKeyProtector _protector;

    public GetTenantPaymentSettingsQueryHandler(
        WixiCoreDbContext db,
        IPaymentKeyProtector protector)
    {
        _db = db;
        _protector = protector;
    }

    public async Task<TenantPaymentSettingsDto> Handle(
        GetTenantPaymentSettingsQuery request, CancellationToken ct)
    {
        var setting = await _db.TenantPaymentSettings
            .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, ct);

        if (setting is null)
        {
            return new TenantPaymentSettingsDto(
                ActiveGateway: "platform_default",
                HasStripeSecretKey: false, StripeSecretKeyHint: null,
                StripePublishableKey: null,
                HasStripeWebhookSecret: false, StripeWebhookSecretHint: null,
                HasIyzipayApiKey: false, IyzipayApiKeyHint: null,
                HasIyzipaySecretKey: false, IyzipaySecretKeyHint: null,
                IyzipayBaseUrl: "https://sandbox-api.iyzipay.com");
        }

        return new TenantPaymentSettingsDto(
            ActiveGateway: setting.ActiveGateway,
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

    private static string? MaskKey(string? value)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= 4) return null;
        return $"{"*".PadRight(value.Length - 4, '*')}{value[^4..]}";
    }
}
