using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Domain.Entities;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Wixi.Modules.Core.Application.Auth.Queries.GetMe;

public record GetMeQuery : IRequest<UserDetailDto?>;

public class GetMeQueryHandler : IRequestHandler<GetMeQuery, UserDetailDto?>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetMeQueryHandler(UserManager<WixiUser> userManager, IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<UserDetailDto?> Handle(GetMeQuery request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return null;

        var user = await _userManager.FindByIdAsync(userId);
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
