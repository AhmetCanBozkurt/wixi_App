using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUsers;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUserById;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUserMenus;
using Wixi.Modules.Core.Application.UserManagement.Commands.SyncUserMenus;
using Wixi.Modules.Core.Application.UserManagement.Commands.UpdateUser;
using Wixi.Modules.Core.Application.UserManagement.Commands.CreateUser;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Application.Navigation.Commands.CreateMenu;
using Wixi.Modules.Core.Application.Navigation.Commands.UpdateMenu;
using Wixi.Modules.Core.Application.Navigation.Commands.DeleteMenu;
using Wixi.Modules.Core.Application.Navigation.Dto;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UserManagementController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserManagementController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _mediator.Send(new GetUsersQuery());
        return Ok(result);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] UserDetailDto user)
    {
        var result = await _mediator.Send(new CreateUserCommand(user));
        return result != null ? Ok(new { id = result }) : BadRequest();
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var result = await _mediator.Send(new GetUserByIdQuery(id));
        return result != null ? Ok(result) : NotFound();
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserDetailDto user)
    {
        if (id != user.Id) return BadRequest();
        var result = await _mediator.Send(new UpdateUserCommand(user));
        return result ? Ok() : BadRequest();
    }

    [HttpGet("users/{id}/menus")]
    public async Task<IActionResult> GetUserMenus(Guid id)
    {
        var result = await _mediator.Send(new GetUserMenusQuery(id));
        return Ok(result);
    }

    [HttpPost("users/{id}/menus/sync")]
    public async Task<IActionResult> SyncUserMenus(Guid id, [FromBody] List<UserMenuSyncDto> menus)
    {
        var result = await _mediator.Send(new SyncUserMenusCommand(id, menus));
        return Ok(new { success = result });
    }

    [HttpPost("users/{id}/menus")]
    public async Task<IActionResult> CreateUserMenu(Guid id, [FromBody] MenuEditDto menu)
    {
        menu.UserId = id;
        var result = await _mediator.Send(new CreateMenuCommand(menu));
        return Ok(new { id = result });
    }

    [HttpPut("users/{id}/menus")]
    public async Task<IActionResult> UpdateUserMenu(Guid id, [FromBody] MenuEditDto menu)
    {
        menu.UserId = id;
        var result = await _mediator.Send(new UpdateMenuCommand(menu));
        return result ? Ok() : NotFound();
    }

    [HttpDelete("users/{userId}/menus/{menuId}")]
    public async Task<IActionResult> DeleteUserMenu(Guid userId, Guid menuId)
    {
        // For now using the generic delete, assuming the ID is enough 
        // but typically we'd verify userId ownership in the handler
        var result = await _mediator.Send(new DeleteMenuCommand(menuId));
        return result ? Ok() : BadRequest();
    }
}
