using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.Incoterm.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Incoterm.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class IncotermsController : ControllerBase
{
    private readonly IMediator _mediator;
    public IncotermsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("incoterms")]
    public async Task<IActionResult> GetIncoterms()
    {
        var result = await _mediator.Send(new GetIncotermsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("incoterms")]
    public async Task<IActionResult> CreateIncoterm([FromBody] CreateIncotermCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("incoterms")]
    public async Task<IActionResult> UpdateIncoterm([FromBody] UpdateIncotermCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("incoterms/{id}")]
    public async Task<IActionResult> DeleteIncoterm(Guid id)
    {
        var result = await _mediator.Send(new DeleteIncotermCommand(id));
        return result ? Ok() : BadRequest();
    }
}
