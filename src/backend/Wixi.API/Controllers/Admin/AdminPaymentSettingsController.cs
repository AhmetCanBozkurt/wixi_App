using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.PaymentSettings.Commands.UpdatePlatformPaymentSettings;
using Wixi.Modules.Core.Application.PaymentSettings.Queries.GetPlatformPaymentSettings;

namespace Wixi.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/payment-settings")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminPaymentSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminPaymentSettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPlatformPaymentSettingsQuery(), ct);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update(
        [FromBody] UpdatePlatformPaymentSettingsCommand command,
        CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { message = "Ödeme ayarları güncellendi." });
    }
}
