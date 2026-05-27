using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Wixi.Modules.ECommerce.Application.Orders.Commands.HandlePaymentCallback;
using Wixi.Modules.ECommerce.Application.Orders.Commands.InitiatePayment;

namespace Wixi.API.Controllers.Storefront;

[ApiController]
[Route("api/v1/public/storefront/payment")]
public class StorefrontPaymentController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly string _frontendBaseUrl;

    public StorefrontPaymentController(IMediator mediator, IOptions<AppUrlsOptions> appUrls)
    {
        _mediator = mediator;
        _frontendBaseUrl = appUrls.Value.FrontendBaseUrl;
    }

    private Guid GetCustomerId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(value!);
    }

    /// <summary>
    /// Authenticated müşteri için Iyzipay checkout formu başlatır.
    /// </summary>
    [HttpPost("initiate")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    public async Task<IActionResult> Initiate([FromBody] InitiatePaymentRequest req, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var tenantSlug = Request.Headers["X-Tenant-Slug"].FirstOrDefault() ?? "store";

        var callbackUrl = $"{_frontendBaseUrl}/api/v1/public/storefront/payment/callback";

        var result = await _mediator.Send(new InitiatePaymentCommand(
            req.OrderId,
            customerId,
            req.BuyerName,
            req.BuyerSurname,
            req.BuyerEmail,
            req.BuyerPhone,
            callbackUrl), ct);

        if (!result.Success)
            return BadRequest(new { error = result.Error });

        return Ok(new { token = result.Token, checkoutFormContent = result.CheckoutFormContent });
    }

    /// <summary>
    /// Iyzipay'in ödeme sonucunu POST ettiği callback endpoint.
    /// form-urlencoded: token, status
    /// </summary>
    [HttpPost("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromForm] IyzipayCallbackForm form, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(form.Token))
            return BadRequest("Token eksik.");

        var tenantSlug = Request.Headers["X-Tenant-Slug"].FirstOrDefault() ?? "store";

        var result = await _mediator.Send(new HandlePaymentCallbackCommand(form.Token, form.Status), ct);

        if (result.Paid)
        {
            var successUrl = $"{_frontendBaseUrl}/store/{tenantSlug}/order-success/{result.OrderNumber}";
            return Redirect(successUrl);
        }
        else
        {
            var errorMsg = Uri.EscapeDataString(result.Error ?? "odeme_basarisiz");
            var failUrl = $"{_frontendBaseUrl}/store/{tenantSlug}/payment-failed?error={errorMsg}";
            return Redirect(failUrl);
        }
    }
}

// ── Request / Form Models ─────────────────────────────────────────────────────

public record InitiatePaymentRequest(
    Guid OrderId,
    string BuyerName,
    string BuyerSurname,
    string BuyerEmail,
    string? BuyerPhone
);

public class IyzipayCallbackForm
{
    [Microsoft.AspNetCore.Mvc.FromForm(Name = "token")]
    public string Token { get; set; } = string.Empty;

    [Microsoft.AspNetCore.Mvc.FromForm(Name = "status")]
    public string? Status { get; set; }
}

// ── AppUrls Options ───────────────────────────────────────────────────────────

public class AppUrlsOptions
{
    public string FrontendBaseUrl { get; set; } = "http://localhost:5183";
}
