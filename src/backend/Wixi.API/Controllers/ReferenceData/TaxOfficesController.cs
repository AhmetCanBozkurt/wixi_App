using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Commands;
using Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class TaxOfficesController : ControllerBase
{
    private readonly IMediator _mediator;
    public TaxOfficesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("tax-offices")]
    public async Task<IActionResult> GetTaxOffices()
    {
        var result = await _mediator.Send(new GetTaxOfficesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("tax-offices")]
    public async Task<IActionResult> CreateTaxOffice([FromBody] CreateTaxOfficeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("tax-offices")]
    public async Task<IActionResult> UpdateTaxOffice([FromBody] UpdateTaxOfficeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("tax-offices/{id}")]
    public async Task<IActionResult> DeleteTaxOffice(Guid id)
    {
        var result = await _mediator.Send(new DeleteTaxOfficeCommand(id));
        return result ? Ok() : BadRequest();
    }
}
