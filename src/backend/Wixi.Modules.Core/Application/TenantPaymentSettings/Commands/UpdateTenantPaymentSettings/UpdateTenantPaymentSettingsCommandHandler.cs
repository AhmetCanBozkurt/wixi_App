using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Commands.UpdateTenantPaymentSettings;

public class UpdateTenantPaymentSettingsCommandHandler
    : IRequestHandler<UpdateTenantPaymentSettingsCommand, Unit>
{
    private readonly WixiCoreDbContext _db;
    private readonly IPaymentKeyProtector _protector;

    public UpdateTenantPaymentSettingsCommandHandler(
        WixiCoreDbContext db,
        IPaymentKeyProtector protector)
    {
        _db = db;
        _protector = protector;
    }

    public async Task<Unit> Handle(
        UpdateTenantPaymentSettingsCommand request, CancellationToken ct)
    {
        var setting = await _db.TenantPaymentSettings
            .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, ct);

        if (setting is null)
        {
            setting = new WixiTenantPaymentSetting { TenantId = request.TenantId };
            _db.TenantPaymentSettings.Add(setting);
        }

        setting.ActiveGateway = request.ActiveGateway;

        if (!string.IsNullOrWhiteSpace(request.StripeSecretKey))
            setting.StripeSecretKey = _protector.Protect(request.StripeSecretKey);

        if (!string.IsNullOrWhiteSpace(request.StripePublishableKey))
            setting.StripePublishableKey = _protector.Protect(request.StripePublishableKey);

        if (!string.IsNullOrWhiteSpace(request.StripeWebhookSecret))
            setting.StripeWebhookSecret = _protector.Protect(request.StripeWebhookSecret);

        if (!string.IsNullOrWhiteSpace(request.IyzipayApiKey))
            setting.IyzipayApiKey = _protector.Protect(request.IyzipayApiKey);

        if (!string.IsNullOrWhiteSpace(request.IyzipaySecretKey))
            setting.IyzipaySecretKey = _protector.Protect(request.IyzipaySecretKey);

        if (!string.IsNullOrWhiteSpace(request.IyzipayBaseUrl))
            setting.IyzipayBaseUrl = request.IyzipayBaseUrl;

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
