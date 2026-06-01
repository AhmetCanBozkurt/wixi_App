using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Wixi.Modules.Core.Application.Subscriptions.Queries.GetSubscriptionPlans;
using Wixi.Shared.Configuration;

namespace Wixi.API.Controllers.Subscriptions;

[ApiController]
[Route("api/v1/plans")]
public class PlansController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly StripeOptions _stripe;

    public PlansController(IMediator mediator, IOptions<StripeOptions> stripe)
    {
        _mediator = mediator;
        _stripe = stripe.Value;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlans(CancellationToken ct)
    {
        var plans = await _mediator.Send(new GetSubscriptionPlansQuery(), ct);
        return Ok(plans);
    }

    [HttpGet("publishable-key")]
    [AllowAnonymous]
    public IActionResult GetPublishableKey()
        => Ok(new { key = _stripe.PublishableKey });
}
