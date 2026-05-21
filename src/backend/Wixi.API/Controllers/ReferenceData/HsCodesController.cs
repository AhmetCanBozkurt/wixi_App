using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.HsCode.Commands;
using Wixi.Modules.Core.Application.ReferenceData.HsCode.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class HsCodesController : ControllerBase
{
    private readonly IMediator _mediator;
    public HsCodesController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("hs-codes")]
    public async Task<IActionResult> GetHsCodes()
    {
        var result = await _mediator.Send(new GetHsCodesQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("hs-codes")]
    public async Task<IActionResult> CreateHsCode([FromBody] CreateHsCodeCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("hs-codes")]
    public async Task<IActionResult> UpdateHsCode([FromBody] UpdateHsCodeCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("hs-codes/{id}")]
    public async Task<IActionResult> DeleteHsCode(Guid id)
    {
        var result = await _mediator.Send(new DeleteHsCodeCommand(id));
        return result ? Ok() : BadRequest();
    }
}
