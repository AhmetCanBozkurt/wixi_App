using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.SystemPage.Commands;
using Wixi.Modules.Core.Application.ReferenceData.SystemPage.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class SystemPagesController : ControllerBase
{
    private readonly IMediator _mediator;
    public SystemPagesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("system-pages")]
    public async Task<IActionResult> GetSystemPages()
    {
        var result = await _mediator.Send(new GetSystemPagesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("system-pages")]
    public async Task<IActionResult> CreateSystemPage([FromBody] CreateSystemPageCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("system-pages")]
    public async Task<IActionResult> UpdateSystemPage([FromBody] UpdateSystemPageCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("system-pages/{id}")]
    public async Task<IActionResult> DeleteSystemPage(Guid id)
    {
        var result = await _mediator.Send(new DeleteSystemPageCommand(id));
        return result ? Ok() : BadRequest();
    }
}
