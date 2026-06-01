using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.Unit.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Unit.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class UnitsController : ControllerBase
{
    private readonly IMediator _mediator;
    public UnitsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("units")]
    public async Task<IActionResult> GetUnits()
    {
        var result = await _mediator.Send(new GetUnitsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("units")]
    public async Task<IActionResult> CreateUnit([FromBody] CreateUnitCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("units")]
    public async Task<IActionResult> UpdateUnit([FromBody] UpdateUnitCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("units/{id}")]
    public async Task<IActionResult> DeleteUnit(Guid id)
    {
        var result = await _mediator.Send(new DeleteUnitCommand(id));
        return result ? Ok() : BadRequest();
    }
}
