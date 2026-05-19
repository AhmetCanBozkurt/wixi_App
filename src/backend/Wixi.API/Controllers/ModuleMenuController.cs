using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Modules.Commands.CreateModuleMenu;
using Wixi.Modules.Core.Application.Modules.Commands.UpdateModuleMenu;
using Wixi.Modules.Core.Application.Modules.Commands.DeleteModuleMenu;
using Wixi.Modules.Core.Application.Modules.Commands.SyncModuleMenus;
using Wixi.Modules.Core.Application.Modules.Queries.GetModuleMenus;

namespace Wixi.API.Controllers;

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/v1/[controller]")]
public class ModuleMenuController : ControllerBase
{
    private readonly IMediator _mediator;

    public ModuleMenuController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{moduleId}")]
    public async Task<ActionResult<List<ModuleMenuDto>>> GetModuleMenus(Guid moduleId)
    {
        return await _mediator.Send(new GetModuleMenusQuery(moduleId));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateModuleMenu([FromBody] CreateModuleMenuCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateModuleMenu(Guid id, [FromBody] UpdateModuleMenuCommand command)
    {
        var updated = await _mediator.Send(command with { Id = id });
        return updated ? Ok() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteModuleMenu(Guid id)
    {
        var deleted = await _mediator.Send(new DeleteModuleMenuCommand(id));
        return deleted ? Ok() : NotFound();
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncMenus([FromBody] SyncModuleMenusCommand command)
    {
        await _mediator.Send(command);
        return Ok();
    }
}
