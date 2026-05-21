using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Subscriptions.Commands.CancelSubscription;
using Wixi.Modules.Core.Application.Subscriptions.Commands.CreateCheckoutSession;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.Subscriptions.Queries.GetTenantSubscription;

namespace Wixi.API.Controllers.Subscriptions;

[ApiController]
[Route("api/v1/saas")]
[Authorize]
public class SaasSubscriptionController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IStripeService _stripe;

    public SaasSubscriptionController(IMediator mediator, IStripeService stripe)
    {
        _mediator = mediator;
        _stripe = stripe;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CreateCheckout([FromBody] CreateCheckoutRequest req, CancellationToken ct)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        var successUrl = $"{origin}/checkout/success?tenant={req.TenantSlug}&session_id={{CHECKOUT_SESSION_ID}}";
        var cancelUrl = $"{origin}/checkout/cancel?tenant={req.TenantSlug}";

        var sessionUrl = await _mediator.Send(new CreateCheckoutSessionCommand(
            req.TenantId,
            req.PlanCode,
            req.BillingInterval ?? "Monthly",
            successUrl,
            cancelUrl), ct);

        return Ok(new { sessionUrl });
    }

    [HttpGet("subscription")]
    public async Task<IActionResult> GetSubscription([FromHeader(Name = "X-Tenant-Slug")] string? tenantSlug, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(tenantSlug))
            return BadRequest(new { error = "X-Tenant-Slug header gerekli." });

        var sub = await _mediator.Send(new GetTenantSubscriptionQuery(tenantSlug), ct);
        if (sub is null) return NotFound(new { error = "Abonelik bulunamadı." });
        return Ok(sub);
    }

    [HttpPost("billing-portal")]
    public async Task<IActionResult> BillingPortal([FromBody] BillingPortalRequest req, CancellationToken ct)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        var returnUrl = $"{origin}/store/billing";

        var url = await _stripe.CreateCustomerPortalSessionAsync(req.StripeCustomerId, returnUrl, ct);
        return Ok(new { url });
    }

    [HttpPost("cancel-subscription")]
    public async Task<IActionResult> Cancel([FromHeader(Name = "X-Tenant-Slug")] string? tenantSlug, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(tenantSlug))
            return BadRequest(new { error = "X-Tenant-Slug header gerekli." });

        await _mediator.Send(new CancelSubscriptionCommand(tenantSlug), ct);
        return Ok(new { message = "Abonelik iptal edildi." });
    }
}

public record CreateCheckoutRequest(Guid TenantId, string TenantSlug, string PlanCode, string? BillingInterval);
public record BillingPortalRequest(string StripeCustomerId);
