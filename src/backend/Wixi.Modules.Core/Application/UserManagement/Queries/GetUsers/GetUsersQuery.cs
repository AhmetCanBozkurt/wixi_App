using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.UserManagement.Queries.GetUsers;

public record GetUsersQuery() : IRequest<List<UserListDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserListDto>>
{
    private readonly WixiCoreDbContext _context;

    public GetUsersQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserListDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users
            .Where(u => !u.IsDeleted)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? "",
                IsActive = u.IsActive,
                ProfilePicture = u.ProfilePicture,
                Roles = new List<string> { "Normal" },
                Menus = new List<Guid>(),
                CreatedAt = u.CreatedAt,
                CreatedByUser = u.CreatedByUser,
                UpdatedAt = u.UpdatedAt,
                UpdatedByUser = u.UpdatedByUser
            })
            .ToListAsync(cancellationToken);
    }
}
