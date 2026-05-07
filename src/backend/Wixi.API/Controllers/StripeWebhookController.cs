using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Subscriptions.Commands.HandleStripeWebhook;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/webhooks")]
public class StripeWebhookController : ControllerBase
{
    private readonly IMediator _mediator;

    public StripeWebhookController(IMediator mediator) => _mediator = mediator;

    [HttpPost("stripe")]
    [AllowAnonymous]
    // Raw body okunmalı — Stripe imza doğrulaması için ApiController model binding'i bypass ediyoruz.
    public async Task<IActionResult> Stripe(CancellationToken ct)
    {
        // Raw body'yi oku
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        var payload = await reader.ReadToEndAsync(ct);
        Request.Body.Position = 0;

        var stripeSignature = Request.Headers["Stripe-Signature"].FirstOrDefault();
        if (string.IsNullOrEmpty(stripeSignature))
            return BadRequest(new { error = "Stripe-Signature header eksik." });

        try
        {
            await _mediator.Send(new HandleStripeWebhookCommand(payload, stripeSignature), ct);
            return Ok(new { received = true });
        }
        catch (Stripe.StripeException)
        {
            return BadRequest(new { error = "Webhook imza doğrulama hatası." });
        }
    }
}
