using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Commands.UpdateTenantPaymentSettings;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Queries.GetTenantPaymentSettings;

namespace Wixi.API.Controllers.StoreAdmin;

[ApiController]
[Route("api/v1/store-admin/payment-settings")]
[Authorize(Roles = "TenantAdmin")]
public class StorePaymentSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorePaymentSettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var tenantId = GetTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        var result = await _mediator.Send(new GetTenantPaymentSettingsQuery(tenantId), ct);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(
        [FromBody] UpdateTenantPaymentSettingsRequest request,
        CancellationToken ct)
    {
        var tenantId = GetTenantId();
        if (tenantId == Guid.Empty) return Unauthorized();

        await _mediator.Send(new UpdateTenantPaymentSettingsCommand(
            TenantId: tenantId,
            ActiveGateway: request.ActiveGateway,
            StripeSecretKey: request.StripeSecretKey,
            StripePublishableKey: request.StripePublishableKey,
            StripeWebhookSecret: request.StripeWebhookSecret,
            IyzipayApiKey: request.IyzipayApiKey,
            IyzipaySecretKey: request.IyzipaySecretKey,
            IyzipayBaseUrl: request.IyzipayBaseUrl), ct);

        return Ok(new { message = "Ödeme ayarları güncellendi." });
    }

    private Guid GetTenantId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == "tenant_id")?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}

public record UpdateTenantPaymentSettingsRequest(
    string ActiveGateway,
    string? StripeSecretKey,
    string? StripePublishableKey,
    string? StripeWebhookSecret,
    string? IyzipayApiKey,
    string? IyzipaySecretKey,
    string? IyzipayBaseUrl
);
