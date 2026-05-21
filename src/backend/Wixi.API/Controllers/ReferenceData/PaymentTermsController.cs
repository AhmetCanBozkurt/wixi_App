using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Commands;
using Wixi.Modules.Core.Application.ReferenceData.PaymentTerm.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class PaymentTermsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PaymentTermsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("payment-terms")]
    public async Task<IActionResult> GetPaymentTerms()
    {
        var result = await _mediator.Send(new GetPaymentTermsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("payment-terms")]
    public async Task<IActionResult> CreatePaymentTerm([FromBody] CreatePaymentTermCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("payment-terms")]
    public async Task<IActionResult> UpdatePaymentTerm([FromBody] UpdatePaymentTermCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("payment-terms/{id}")]
    public async Task<IActionResult> DeletePaymentTerm(Guid id)
    {
        var result = await _mediator.Send(new DeletePaymentTermCommand(id));
        return result ? Ok() : BadRequest();
    }
}
