using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.ReferenceData.Region.Commands;
using Wixi.Modules.Core.Application.ReferenceData.Region.Queries;

namespace Wixi.API.Controllers.ReferenceData;

[ApiController]
[Route("api/v1/ref")]
public class RegionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public RegionsController(IMediator mediator) => _mediator = mediator;

    [AllowAnonymous]
    [HttpGet("regions")]
    public async Task<IActionResult> GetRegions()
    {
        var result = await _mediator.Send(new GetRegionsQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost("regions")]
    public async Task<IActionResult> CreateRegion([FromBody] CreateRegionCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut("regions")]
    public async Task<IActionResult> UpdateRegion([FromBody] UpdateRegionCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("regions/{id}")]
    public async Task<IActionResult> DeleteRegion(Guid id)
    {
        var result = await _mediator.Send(new DeleteRegionCommand(id));
        return result ? Ok() : BadRequest();
    }
}
