using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.ImportSelectedUserMenus;

public class ImportSelectedUserMenusCommandHandler : IRequestHandler<ImportSelectedUserMenusCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public ImportSelectedUserMenusCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ImportSelectedUserMenusCommand request, CancellationToken cancellationToken)
    {
        if (request.TargetUserId == request.SourceUserId) return false;

        var selected = (request.MenuIds ?? new List<Guid>())
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        if (selected.Count == 0) return true;

        if (request.ReplaceTarget)
        {
            var targetMenus = await _context.Menus
                .Where(m => m.UserId == request.TargetUserId && !m.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var m in targetMenus)
                m.IsDeleted = true;

            await _context.SaveChangesAsync(cancellationToken);
        }

        var sourceMenus = await _context.Menus
            .Include(m => m.Translations)
            .Where(m => m.UserId == request.SourceUserId && !m.IsDeleted)
            .OrderBy(m => m.SortOrder)
            .ToListAsync(cancellationToken);

        if (sourceMenus.Count == 0) return true;

        var byId = sourceMenus.ToDictionary(m => m.Id, m => m);

        // Expand: include descendants + ancestors so subtree stays valid
        var toCopy = new HashSet<Guid>();
        foreach (var id in selected)
        {
            if (!byId.ContainsKey(id)) continue;
            AddWithDescendants(id);
            AddAncestors(id);
        }

        void AddWithDescendants(Guid root)
        {
            var stack = new Stack<Guid>();
            stack.Push(root);
            while (stack.Count > 0)
            {
                var cur = stack.Pop();
                if (!toCopy.Add(cur)) continue;
                foreach (var child in sourceMenus.Where(m => m.ParentId == cur).Select(m => m.Id))
                    stack.Push(child);
            }
        }

        void AddAncestors(Guid nodeId)
        {
            var cur = byId[nodeId];
            while (cur.ParentId.HasValue && byId.TryGetValue(cur.ParentId.Value, out var parent))
            {
                if (!toCopy.Add(parent.Id)) break;
                cur = parent;
            }
        }

        var listToCopy = sourceMenus.Where(m => toCopy.Contains(m.Id)).ToList();
        if (listToCopy.Count == 0) return true;

        var idMap = new Dictionary<Guid, Guid>(capacity: listToCopy.Count);
        var clones = new List<WixiMenu>(capacity: listToCopy.Count);

        foreach (var src in listToCopy)
        {
            var newId = Guid.NewGuid();
            idMap[src.Id] = newId;

            var clone = new WixiMenu
            {
                Id = newId,
                UserId = request.TargetUserId,
                ParentId = null, // wire later
                Path = src.Path,
                Icon = src.Icon,
                IconColor = src.IconColor,
                SortOrder = src.SortOrder,
                IsVisible = src.IsVisible,
                IsActive = src.IsActive,
                IsDeleted = false
            };

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

            clones.Add(clone);
        }

        var cloneByNewId = clones.ToDictionary(c => c.Id, c => c);
        foreach (var src in listToCopy)
        {
            var clone = cloneByNewId[idMap[src.Id]];
            if (src.ParentId.HasValue &&
                toCopy.Contains(src.ParentId.Value) &&
                idMap.TryGetValue(src.ParentId.Value, out var newParentId))
            {
                clone.ParentId = newParentId;
            }
            else
            {
                // root of the imported selection => place at root
                clone.ParentId = null;
            }
        }

        await _context.Menus.AddRangeAsync(clones, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

