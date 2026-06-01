using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.WebBuilder.Application.CorpSettings.Commands;
using Wixi.Modules.WebBuilder.Application.CorpSettings.Queries;

namespace Wixi.API.Controllers.WebBuilder;

[ApiController]
[Route("api/v1/web-builder/settings")]
[Authorize(Roles = "TenantAdmin")]
public class CorpSettingsController(IMediator mediator, WixiCoreDbContext db)
    : WebBuilderControllerBase(db)
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var tenantId = await ResolveTenantIdAsync(ct);
        if (tenantId == Guid.Empty) return Unauthorized();

        var result = await mediator.Send(new GetCorpSettingsQuery(tenantId), ct);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateCorpSettingsRequest request, CancellationToken ct)
    {
        var tenantId = await ResolveTenantIdAsync(ct);
        if (tenantId == Guid.Empty) return Unauthorized();

        await mediator.Send(new UpdateCorpSettingsCommand(tenantId, request.GlobalComponentsConfigJson), ct);
        return NoContent();
    }
}

public record UpdateCorpSettingsRequest(string? GlobalComponentsConfigJson);
