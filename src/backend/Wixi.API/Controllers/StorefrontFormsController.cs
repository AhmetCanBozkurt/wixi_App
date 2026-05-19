using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Contact.Commands;
using Wixi.Modules.ECommerce.Application.Newsletter.Commands;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/public/storefront")]
[AllowAnonymous]
public class StorefrontFormsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontFormsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("newsletter")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeNewsletterRequest req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new SubscribeNewsletterCommand(req.Email), ct);
            return Ok(new { message = "E-bülten aboneliğiniz başarıyla oluşturuldu." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("contact")]
    public async Task<IActionResult> Contact([FromBody] ContactFormRequest req, CancellationToken ct)
    {
        await _mediator.Send(new SubmitContactFormCommand(req.Name, req.Email, req.Subject, req.Message), ct);
        return Ok(new { message = "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız." });
    }
}

public record SubscribeNewsletterRequest(string Email);

public record ContactFormRequest(
    string Name,
    string Email,
    string Subject,
    string Message
);
