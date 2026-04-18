using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Navigation.Commands.CreateMenu;
using Wixi.Modules.Core.Application.Navigation.Commands.DeleteMenu;
using Wixi.Modules.Core.Application.Navigation.Commands.UpdateMenu;
using Wixi.Modules.Core.Application.Navigation.Queries.GetAllMenus;
using Wixi.Modules.Core.Application.Navigation.Queries.GetSidebarMenus;

namespace Wixi.API.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class MenuController : ControllerBase
{
    private readonly IMediator _mediator;

    public MenuController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("sidebar")]
    public async Task<IActionResult> GetSidebarMenus()
    {
        var result = await _mediator.Send(new GetSidebarMenusQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllMenus()
    {
        var result = await _mediator.Send(new GetAllMenusQuery());
        return Ok(new { items = result });
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateMenuCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [Authorize(Roles = "SuperAdmin,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteMenuCommand(id));
        return result ? Ok() : BadRequest();
    }
}
