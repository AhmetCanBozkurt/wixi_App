using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Queries.GetUserRoles;

public record GetUserRolesQuery(Guid UserId) : IRequest<List<string>>;

public class GetUserRolesQueryHandler : IRequestHandler<GetUserRolesQuery, List<string>>
{
    private readonly UserManager<WixiUser> _userManager;

    public GetUserRolesQueryHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<List<string>> Handle(GetUserRolesQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null) return new List<string>();

        var roles = await _userManager.GetRolesAsync(user);
        return roles.OrderBy(x => x).ToList();
    }
}

