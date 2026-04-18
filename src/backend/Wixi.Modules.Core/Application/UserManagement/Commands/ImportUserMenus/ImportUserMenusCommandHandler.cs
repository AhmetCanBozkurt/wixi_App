using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.ImportUserMenus;

public class ImportUserMenusCommandHandler : IRequestHandler<ImportUserMenusCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public ImportUserMenusCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ImportUserMenusCommand request, CancellationToken cancellationToken)
    {
        if (request.TargetUserId == request.SourceUserId) return false;

        if (request.ReplaceTarget)
        {
            var targetMenus = await _context.Menus
                .Where(m => m.UserId == request.TargetUserId && !m.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var m in targetMenus)
            {
                m.IsDeleted = true;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        var sourceMenus = await _context.Menus
            .Include(m => m.Translations)
            .Where(m => m.UserId == request.SourceUserId && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        if (sourceMenus.Count == 0) return true;

        var idMap = new Dictionary<Guid, Guid>(capacity: sourceMenus.Count);
        var clones = new List<WixiMenu>(capacity: sourceMenus.Count);

        // First pass: create clones and map ids
        foreach (var src in sourceMenus)
        {
            var newId = Guid.NewGuid();
            idMap[src.Id] = newId;

            var clone = new WixiMenu
            {
                Id = newId,
                UserId = request.TargetUserId,
                ParentId = null, // will be set in 2nd pass
                Path = src.Path,
                Icon = src.Icon,
                IconColor = src.IconColor,
                SortOrder = src.SortOrder,
                IsVisible = src.IsVisible,
                IsActive = src.IsActive,
                IsDeleted = false,
            };

            if (src.Translations != null)
            {
                foreach (var tr in src.Translations.Where(t => !t.IsDeleted))
                {
                    clone.Translations.Add(new WixiMenuTranslation
                    {
                        Id = Guid.NewGuid(),
                        MenuId = newId,
                        LanguageId = tr.LanguageId,
                        Title = tr.Title,
                        IsActive = tr.IsActive,
                        IsDeleted = false
                    });
                }
            }

            clones.Add(clone);
        }

        // Second pass: wire ParentId
        var cloneById = clones.ToDictionary(c => c.Id, c => c);
        foreach (var src in sourceMenus)
        {
            var clone = cloneById[idMap[src.Id]];
            if (src.ParentId.HasValue && idMap.TryGetValue(src.ParentId.Value, out var newParentId))
            {
                clone.ParentId = newParentId;
            }
            else
            {
                clone.ParentId = null;
            }
        }

        await _context.Menus.AddRangeAsync(clones, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

