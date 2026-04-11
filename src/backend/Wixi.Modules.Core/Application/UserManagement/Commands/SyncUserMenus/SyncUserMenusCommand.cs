using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.UserManagement.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.SyncUserMenus;

public record SyncUserMenusCommand(Guid UserId, List<UserMenuSyncDto> Menus) : IRequest<bool>;

public class SyncUserMenusCommandHandler : IRequestHandler<SyncUserMenusCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public SyncUserMenusCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(SyncUserMenusCommand request, CancellationToken cancellationToken)
    {
        var existingMenus = await _context.Menus
            .Where(m => m.UserId == request.UserId && !m.IsDeleted)
            .ToListAsync(cancellationToken);

        // We only update ParentId & SortOrder from the drag & drop array.
        // Creation & Deletion of nodes will happen through their own dedicated Modals.
        foreach (var dto in request.Menus)
        {
            var existing = existingMenus.FirstOrDefault(e => e.Id == dto.Id);
            if (existing != null)
            {
                existing.ParentId = dto.ParentId;
                existing.SortOrder = dto.SortOrder;
                existing.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
