using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Wixi.Modules.Core.Application.Subscriptions.Commands.CancelSubscription;
using Wixi.Modules.Core.Application.Subscriptions.Commands.CreateCheckoutSession;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.Subscriptions.Queries.GetTenantSubscription;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Infrastructure.Services;

namespace Wixi.API.Controllers.Subscriptions;

[ApiController]
[Route("api/v1/saas")]
[Authorize]
public class SaasSubscriptionController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IStripeService _stripe;
    private readonly IIyzipayService _iyzipay;
    private readonly WixiCoreDbContext _db;
    private readonly IConfiguration _configuration;

    public SaasSubscriptionController(
        IMediator mediator,
        IStripeService stripe,
        IIyzipayService iyzipay,
        WixiCoreDbContext db,
        IConfiguration configuration)
    {
        _mediator = mediator;
        _stripe = stripe;
        _iyzipay = iyzipay;
        _db = db;
        _configuration = configuration;
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

    [HttpPost("payment/iyzico/initiate")]
    public async Task<IActionResult> InitiateIyzipayCheckout([FromBody] CreateCheckoutRequest req, CancellationToken ct)
    {
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Id == req.TenantId, ct);
        if (tenant == null) return NotFound(new { error = "Mağaza bulunamadı." });

        var plan = await _db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == req.PlanCode && p.IsActive && !p.IsDeleted, ct);
        if (plan == null) return NotFound(new { error = "Plan bulunamadı." });

        var billingInterval = req.BillingInterval ?? "Monthly";
        var price = billingInterval == "Yearly" ? plan.PriceYearly : plan.PriceMonthly;

        var origin = $"{Request.Scheme}://{Request.Host}";
        var callbackUrl = $"{origin}/api/v1/saas/payment/iyzico/callback?tenant={tenant.Slug}&plan={plan.Code}&interval={billingInterval}";

        var conversationId = Guid.NewGuid().ToString("N");
        var basketItems = new List<(string id, string name, decimal price, string category)>
        {
            (plan.Id.ToString("N"), $"{plan.Name} SaaS Subscription Plan", price, "SaaS Plan")
        };

        var result = await _iyzipay.CreateCheckoutFormAsync(
            conversationId: conversationId,
            price: price,
            paidPrice: price,
            currency: "TRY",
            buyerName: tenant.Name,
            buyerSurname: "Admin",
            buyerEmail: tenant.OwnerEmail,
            buyerGsmNumber: string.Empty,
            buyerIdentityNumber: "11111111111",
            shippingAddress: "Wixi Istanbul",
            billingAddress: "Wixi Istanbul",
            basketItems: basketItems,
            callbackUrl: callbackUrl,
            ct: ct);

        if (!result.Success)
            return BadRequest(new { error = result.ErrorMessage });

        return Ok(new
        {
            token = result.Token,
            checkoutFormContent = result.CheckoutFormContent
        });
    }

    [HttpPost("payment/iyzico/callback")]
    [AllowAnonymous]
    public async Task<IActionResult> IyzipayCallback(
        [FromForm] string token,
        [FromQuery] string tenant,
        [FromQuery] string plan,
        [FromQuery] string interval,
        CancellationToken ct)
    {
        var frontendUrl = _configuration["AppUrls:FrontendBaseUrl"] ?? "http://localhost:5183";
        var paymentResult = await _iyzipay.RetrieveCheckoutFormAsync(token, ct);

        if (!paymentResult.Success)
        {
            return Redirect($"{frontendUrl}/checkout/cancel?tenant={tenant}");
        }

        var tenantEntity = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == tenant, ct);
        if (tenantEntity == null) return Redirect($"{frontendUrl}/checkout/cancel?tenant={tenant}");

        var planEntity = await _db.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Code == plan && p.IsActive && !p.IsDeleted, ct);
        if (planEntity == null) return Redirect($"{frontendUrl}/checkout/cancel?tenant={tenant}");

        // Aktif aboneliği güncelle veya yeni oluştur
        var subscription = await _db.TenantSubscriptions
            .FirstOrDefaultAsync(s => s.TenantId == tenantEntity.Id, ct);

        var now = DateTime.UtcNow;
        var periodEnd = interval == "Yearly" ? now.AddYears(1) : now.AddMonths(1);

        if (subscription != null)
        {
            subscription.PlanId = planEntity.Id;
            subscription.Status = "Active";
            subscription.CurrentPeriodStart = now;
            subscription.CurrentPeriodEnd = periodEnd;
            subscription.BillingInterval = interval;
            subscription.PaymentMethod = "CreditCard";
            subscription.UpdatedAt = now;
            _db.TenantSubscriptions.Update(subscription);
        }
        else
        {
            _db.TenantSubscriptions.Add(new WixiTenantSubscription
            {
                TenantId = tenantEntity.Id,
                PlanId = planEntity.Id,
                Status = "Active",
                CurrentPeriodStart = now,
                CurrentPeriodEnd = periodEnd,
                BillingInterval = interval,
                PaymentMethod = "CreditCard"
            });
        }

        tenantEntity.Plan = plan;
        _db.Tenants.Update(tenantEntity);

        await _db.SaveChangesAsync(ct);

        return Redirect($"{frontendUrl}/checkout/success?tenant={tenant}&paid=true");
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
