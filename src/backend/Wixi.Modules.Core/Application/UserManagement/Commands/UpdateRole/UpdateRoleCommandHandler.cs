using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.UpdateRole;

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, bool>
{
    private readonly RoleManager<WixiRole> _roleManager;

    public UpdateRoleCommandHandler(RoleManager<WixiRole> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<bool> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
        if (role == null) return false;

        // SuperAdmin role is immutable from UI
        if (string.Equals(role.Name, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            return false;

        var name = (request.Name ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(name)) return false;

        // Prevent renaming any role to SuperAdmin
        if (string.Equals(name, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            return false;

        // Prevent duplicates
        var existing = await _roleManager.FindByNameAsync(name);
        if (existing != null && existing.Id != role.Id)
            return false;

        role.Name = name;
        role.Description = request.Description;

        var res = await _roleManager.UpdateAsync(role);
        return res.Succeeded;
    }
}

