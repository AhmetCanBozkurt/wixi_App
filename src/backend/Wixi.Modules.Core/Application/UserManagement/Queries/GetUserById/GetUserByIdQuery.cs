using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.UserManagement.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDetailDto?>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDetailDto?>
{
    private readonly UserManager<WixiUser> _userManager;

    public GetUserByIdQueryHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserDetailDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id.ToString());
        if (user == null) return null;

        return new UserDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            Username = user.UserName ?? string.Empty,
            IsActive = user.IsActive,
            ProfilePicture = user.ProfilePicture
        };
    }
}
