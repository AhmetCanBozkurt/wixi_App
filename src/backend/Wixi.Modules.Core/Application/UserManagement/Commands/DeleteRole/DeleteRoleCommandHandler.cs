using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.DeleteRole;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, bool>
{
    private readonly RoleManager<WixiRole> _roleManager;
    private readonly WixiCoreDbContext _dbContext;

    public DeleteRoleCommandHandler(RoleManager<WixiRole> roleManager, WixiCoreDbContext dbContext)
    {
        _roleManager = roleManager;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByIdAsync(request.RoleId.ToString());
        if (role == null) return false;

        // Prevent deleting core/system roles
        if (string.Equals(role.Name, "SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(role.Name, "Admin", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(role.Name, "Normal", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // If role has users, forbid deletion
        var hasUsers = await _dbContext.Set<IdentityUserRole<Guid>>()
            .AnyAsync(x => x.RoleId == role.Id, cancellationToken);

        if (hasUsers) return false;

        var res = await _roleManager.DeleteAsync(role);
        return res.Succeeded;
    }
}

