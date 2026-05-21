using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.TransportMode.Commands;
using Wixi.Modules.Core.Application.ReferenceData.TransportMode.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class TransportModesController : ControllerBase
{
    private readonly IMediator _mediator;
    public TransportModesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("transport-modes")]
    public async Task<IActionResult> GetTransportModes()
    {
        var result = await _mediator.Send(new GetTransportModesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("transport-modes")]
    public async Task<IActionResult> CreateTransportMode([FromBody] CreateTransportModeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("transport-modes")]
    public async Task<IActionResult> UpdateTransportMode([FromBody] UpdateTransportModeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("transport-modes/{id}")]
    public async Task<IActionResult> DeleteTransportMode(Guid id)
    {
        var result = await _mediator.Send(new DeleteTransportModeCommand(id));
        return result ? Ok() : BadRequest();
    }
}
