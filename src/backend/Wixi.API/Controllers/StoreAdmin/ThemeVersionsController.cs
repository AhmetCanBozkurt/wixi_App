using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.CreateCheckpoint;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.RollbackThemeVersion;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Queries.GetThemeVersionById;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Queries.GetThemeVersions;

namespace Wixi.API.Controllers.StoreAdmin;

[ApiController]
[Route("api/v1/store-admin")]
[Authorize]
public class ThemeVersionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ThemeVersionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("theme-versions")]
    public async Task<IActionResult> GetThemeVersions(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetThemeVersionsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("theme-versions/{id:int}")]
    public async Task<IActionResult> GetThemeVersion(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetThemeVersionByIdQuery(id), ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("theme-versions/checkpoint")]
    public async Task<IActionResult> CreateCheckpoint([FromBody] CreateCheckpointRequest req, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateCheckpointCommand(req.Label, User.Identity?.Name), ct);
        return Ok(new { id });
    }

    [HttpPost("theme-versions/{id:int}/rollback")]
    public async Task<IActionResult> RollbackVersion(int id, CancellationToken ct)
    {
        var success = await _mediator.Send(new RollbackThemeVersionCommand(id, User.Identity?.Name), ct);
        if (!success) return NotFound();
        return NoContent();
    }
}

public record CreateCheckpointRequest(string Label);
