using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Queries.GetRoles;

public record RoleDto(string Id, string Name, string? Description);

public record GetRolesQuery : IRequest<List<RoleDto>>;

public class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, List<RoleDto>>
{
    private readonly RoleManager<WixiRole> _roleManager;

    public GetRolesQueryHandler(RoleManager<WixiRole> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<List<RoleDto>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        // EF translation: filter/order on entity fields before projecting to record
        var roles = await _roleManager.Roles
            .Where(r => r.Name != null && r.Name != "" && r.Name != "SuperAdmin")
            .OrderBy(r => r.Name)
            .Select(r => new { r.Id, r.Name, r.Description })
            .ToListAsync(cancellationToken);

        return roles
            .Select(r => new RoleDto(r.Id.ToString(), r.Name!, r.Description))
            .ToList();
    }
}

