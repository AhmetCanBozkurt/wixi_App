using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.UpdateUserRoles;

public class UpdateUserRolesCommandHandler : IRequestHandler<UpdateUserRolesCommand, bool>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly RoleManager<WixiRole> _roleManager;

    public UpdateUserRolesCommandHandler(UserManager<WixiUser> userManager, RoleManager<WixiRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<bool> Handle(UpdateUserRolesCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return false;

        var desired = (request.Roles ?? new List<string>())
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        // SuperAdmin is system-only; ignore any attempt to assign/remove from this endpoint
        desired = desired
            .Where(r => !string.Equals(r, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            .ToList();

        // Filter to roles that actually exist
        var valid = new List<string>();
        foreach (var r in desired)
        {
            if (await _roleManager.RoleExistsAsync(r))
                valid.Add(r);
        }

        var current = await _userManager.GetRolesAsync(user);

        var toRemove = current
            .Where(cr => !string.Equals(cr, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            .Where(cr => !valid.Contains(cr, StringComparer.OrdinalIgnoreCase))
            .ToList();
        if (toRemove.Count > 0)
        {
            var rem = await _userManager.RemoveFromRolesAsync(user, toRemove);
            if (!rem.Succeeded) return false;
        }

        var toAdd = valid.Where(vr => !current.Contains(vr, StringComparer.OrdinalIgnoreCase)).ToList();
        if (toAdd.Count > 0)
        {
            var add = await _userManager.AddToRolesAsync(user, toAdd);
            if (!add.Succeeded) return false;
        }

        return true;
    }
}

