using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Domain.Entities;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Wixi.Modules.Core.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Wixi.Modules.Core.Application.Auth.Queries.GetMe;

public record GetMeQuery : IRequest<UserDetailDto?>;

public class GetMeQueryHandler : IRequestHandler<GetMeQuery, UserDetailDto?>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly WixiCoreDbContext _context;

    public GetMeQueryHandler(UserManager<WixiUser> userManager, IHttpContextAccessor httpContextAccessor, WixiCoreDbContext context)
    {
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }

    public async Task<UserDetailDto?> Handle(GetMeQuery request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return null;

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);

        var dto = new UserDetailDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            Username = user.UserName ?? string.Empty,
            IsActive = user.IsActive,
            ProfilePicture = user.ProfilePicture,
            Roles = roles.ToList()
        };

        var targetTenantId = user.TenantId;

        // If user is a TenantAdmin but doesn't have a specific TenantId set yet, 
        // try to find the tenant they own.
        if (targetTenantId == null && roles.Contains("TenantAdmin"))
        {
            var ownedTenant = await _context.Tenants.FirstOrDefaultAsync(t => t.OwnerUserId == user.Id, cancellationToken);
            if (ownedTenant != null) targetTenantId = ownedTenant.Id;
        }

        if (targetTenantId != null)
        {
            var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == targetTenantId, cancellationToken);
            if (tenant != null)
            {
                dto.TenantId = tenant.Id;
                dto.TenantSlug = tenant.Slug;
                dto.TenantName = tenant.Name;
            }
        }

        return dto;
    }
}
