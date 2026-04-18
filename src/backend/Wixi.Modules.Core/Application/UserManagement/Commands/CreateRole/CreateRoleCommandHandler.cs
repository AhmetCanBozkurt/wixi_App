using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.CreateRole;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, bool>
{
    private readonly RoleManager<WixiRole> _roleManager;

    public CreateRoleCommandHandler(RoleManager<WixiRole> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<bool> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var name = (request.Name ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(name)) return false;

        // System role is reserved
        if (string.Equals(name, "SuperAdmin", StringComparison.OrdinalIgnoreCase))
            return false;

        if (await _roleManager.RoleExistsAsync(name))
            return true;

        var role = new WixiRole
        {
            Name = name,
            Description = request.Description
        };

        var res = await _roleManager.CreateAsync(role);
        return res.Succeeded;
    }
}

