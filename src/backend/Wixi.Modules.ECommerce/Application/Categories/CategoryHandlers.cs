using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Categories;

// ─── DTOs ──────────────────────────────────────────────────────────
public record CategoryDto(Guid Id, string Name, string Slug, Guid? ParentId, string? ParentName,
    int SortOrder, bool IsActive, DateTime CreatedAt, string? CreatedByUser, DateTime? UpdatedAt, string? UpdatedByUser);

// ─── Commands ──────────────────────────────────────────────────────
public record CreateCategoryCommand(string Name, string Slug, Guid? ParentId, string? Description,
    int SortOrder = 0) : IRequest<Guid>;

public record UpdateCategoryCommand(Guid Id, string Name, string Slug, Guid? ParentId,
    string? Description, int SortOrder, bool IsActive) : IRequest<bool>;

public record DeleteCategoryCommand(Guid Id) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetCategoriesQuery(string? Search = null, bool IncludeInactive = false)
    : IRequest<IReadOnlyList<CategoryDto>>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreateCategoryCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreateCategoryCommand r, CancellationToken ct)
    {
        var cat = new WixiCategory { Name = r.Name, Slug = r.Slug, ParentId = r.ParentId,
            Description = r.Description, SortOrder = r.SortOrder };
        _db.Categories.Add(cat);
        await _db.SaveChangesAsync(ct);
        return cat.Id;
    }
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public UpdateCategoryCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(UpdateCategoryCommand r, CancellationToken ct)
    {
        var cat = await _db.Categories.FirstOrDefaultAsync(c => c.Id == r.Id && !c.IsDeleted, ct);
        if (cat is null) return false;
        cat.Name = r.Name; cat.Slug = r.Slug; cat.ParentId = r.ParentId;
        cat.SortOrder = r.SortOrder; cat.IsActive = r.IsActive; cat.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteCategoryCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteCategoryCommand r, CancellationToken ct)
    {
        var cat = await _db.Categories.FirstOrDefaultAsync(c => c.Id == r.Id && !c.IsDeleted, ct);
        if (cat is null) return false;
        cat.IsDeleted = true; cat.IsActive = false; cat.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IReadOnlyList<CategoryDto>>
{
    private readonly ECommerceDbContext _db;
    public GetCategoriesQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<CategoryDto>> Handle(GetCategoriesQuery r, CancellationToken ct)
    {
        var q = _db.Categories.AsNoTracking().Include(c => c.Parent).Where(c => !c.IsDeleted);
        if (!r.IncludeInactive) q = q.Where(c => c.IsActive);
        if (!string.IsNullOrWhiteSpace(r.Search))
        { var s = r.Search.ToLower(); q = q.Where(c => c.Name.ToLower().Contains(s)); }
        return await q.OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.ParentId,
                c.Parent != null ? c.Parent.Name : null, c.SortOrder, c.IsActive,
                c.CreatedAt, c.CreatedByUser, c.UpdatedAt, c.UpdatedByUser))
            .ToListAsync(ct);
    }
}
