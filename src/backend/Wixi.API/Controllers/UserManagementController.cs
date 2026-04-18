using MediatR;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUsers;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUserById;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUserMenus;
using Wixi.Modules.Core.Application.UserManagement.Commands.SyncUserMenus;
using Wixi.Modules.Core.Application.UserManagement.Commands.UpdateUser;
using Wixi.Modules.Core.Application.UserManagement.Commands.CreateUser;
using Wixi.Modules.Core.Application.UserManagement.Commands.ImportUserMenus;
using Wixi.Modules.Core.Application.UserManagement.Commands.ImportSelectedUserMenus;
using Wixi.Modules.Core.Application.UserManagement.Commands.UpdateUserRoles;
using Wixi.Modules.Core.Application.UserManagement.Commands.CreateRole;
using Wixi.Modules.Core.Application.UserManagement.Commands.UpdateRole;
using Wixi.Modules.Core.Application.UserManagement.Commands.DeleteRole;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetRoles;
using Wixi.Modules.Core.Application.UserManagement.Queries.GetUserRoles;
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
        return Ok(new { items = result });
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
        return Ok(new { items = result });
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _mediator.Send(new GetRolesQuery());
        return Ok(new { items = roles });
    }

    public record UpsertRoleRequest(string Name, string? Description);

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] UpsertRoleRequest body)
    {
        var ok = await _mediator.Send(new CreateRoleCommand(body?.Name ?? string.Empty, body?.Description));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    [HttpPut("roles/{roleId}")]
    public async Task<IActionResult> UpdateRole(Guid roleId, [FromBody] UpsertRoleRequest body)
    {
        var ok = await _mediator.Send(new UpdateRoleCommand(roleId, body?.Name ?? string.Empty, body?.Description));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    [HttpDelete("roles/{roleId}")]
    public async Task<IActionResult> DeleteRole(Guid roleId)
    {
        var ok = await _mediator.Send(new DeleteRoleCommand(roleId));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    [HttpGet("users/{id}/roles")]
    public async Task<IActionResult> GetUserRoles(Guid id)
    {
        var roles = await _mediator.Send(new GetUserRolesQuery(id));
        return Ok(new { items = roles });
    }

    public record UpdateUserRolesRequest(List<string> Roles);

    [HttpPut("users/{id}/roles")]
    public async Task<IActionResult> UpdateUserRoles(Guid id, [FromBody] UpdateUserRolesRequest body)
    {
        var ok = await _mediator.Send(new UpdateUserRolesCommand(id, body?.Roles ?? new List<string>()));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
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

    [HttpPost("users/{targetUserId}/menus/import-from/{sourceUserId}")]
    public async Task<IActionResult> ImportMenusFromUser(Guid targetUserId, Guid sourceUserId, [FromQuery] bool replace = true)
    {
        var result = await _mediator.Send(new ImportUserMenusCommand(targetUserId, sourceUserId, replace));
        return Ok(new { success = result });
    }

    public record ImportSelectedMenusRequest(List<Guid> MenuIds, bool ReplaceTarget = false);

    [HttpPost("users/{targetUserId}/menus/import-selected-from/{sourceUserId}")]
    public async Task<IActionResult> ImportSelectedMenusFromUser(Guid targetUserId, Guid sourceUserId, [FromBody] ImportSelectedMenusRequest body)
    {
        var ok = await _mediator.Send(new ImportSelectedUserMenusCommand(
            targetUserId,
            sourceUserId,
            body?.MenuIds ?? new List<Guid>(),
            body?.ReplaceTarget ?? false));

        return Ok(new { success = ok });
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
