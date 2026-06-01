using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.Port.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Port.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class PortsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PortsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("ports")]
    public async Task<IActionResult> GetPorts()
    {
        var result = await _mediator.Send(new GetPortsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("ports")]
    public async Task<IActionResult> CreatePort([FromBody] CreatePortCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("ports")]
    public async Task<IActionResult> UpdatePort([FromBody] UpdatePortCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("ports/{id}")]
    public async Task<IActionResult> DeletePort(Guid id)
    {
        var result = await _mediator.Send(new DeletePortCommand(id));
        return result ? Ok() : BadRequest();
    }
}
