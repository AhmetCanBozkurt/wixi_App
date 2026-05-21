using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Commands;
using Wixi.Modules.Core.Application.ReferenceData.UnitConversion.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class UnitConversionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public UnitConversionsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("unit-conversions")]
    public async Task<IActionResult> GetUnitConversions()
    {
        var result = await _mediator.Send(new GetUnitConversionsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("unit-conversions")]
    public async Task<IActionResult> CreateUnitConversion([FromBody] CreateUnitConversionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("unit-conversions")]
    public async Task<IActionResult> UpdateUnitConversion([FromBody] UpdateUnitConversionCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("unit-conversions/{id}")]
    public async Task<IActionResult> DeleteUnitConversion(Guid id)
    {
        var result = await _mediator.Send(new DeleteUnitConversionCommand(id));
        return result ? Ok() : BadRequest();
    }
}
