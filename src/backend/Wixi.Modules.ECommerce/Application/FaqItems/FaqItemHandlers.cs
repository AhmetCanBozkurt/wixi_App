using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.FaqItems;

// ─── DTOs ──────────────────────────────────────────────────────────
public record FaqItemDto(
    Guid Id,
    string Question,
    string Answer,
    string? Category,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt);

// ─── Commands ──────────────────────────────────────────────────────
public record CreateFaqItemCommand(
    string Question,
    string Answer,
    string? Category,
    int SortOrder) : IRequest<Guid>;

public record UpdateFaqItemCommand(
    Guid Id,
    string Question,
    string Answer,
    string? Category,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public record DeleteFaqItemCommand(Guid Id) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetFaqItemsQuery(string? Category = null, bool IncludeInactive = false)
    : IRequest<IReadOnlyList<FaqItemDto>>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreateFaqItemCommandHandler : IRequestHandler<CreateFaqItemCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreateFaqItemCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreateFaqItemCommand r, CancellationToken ct)
    {
        var entity = new WixiFaqItem
        {
            Question = r.Question,
            Answer = r.Answer,
            Category = r.Category,
            SortOrder = r.SortOrder
        };
        _db.FaqItems.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.Id;
    }
}

public class UpdateFaqItemCommandHandler : IRequestHandler<UpdateFaqItemCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public UpdateFaqItemCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(UpdateFaqItemCommand r, CancellationToken ct)
    {
        var entity = await _db.FaqItems.FirstOrDefaultAsync(f => f.Id == r.Id && !f.IsDeleted, ct);
        if (entity is null) return false;
        entity.Question = r.Question;
        entity.Answer = r.Answer;
        entity.Category = r.Category;
        entity.SortOrder = r.SortOrder;
        entity.IsActive = r.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteFaqItemCommandHandler : IRequestHandler<DeleteFaqItemCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteFaqItemCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteFaqItemCommand r, CancellationToken ct)
    {
        var entity = await _db.FaqItems.FirstOrDefaultAsync(f => f.Id == r.Id && !f.IsDeleted, ct);
        if (entity is null) return false;
        entity.IsDeleted = true; entity.IsActive = false; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetFaqItemsQueryHandler : IRequestHandler<GetFaqItemsQuery, IReadOnlyList<FaqItemDto>>
{
    private readonly ECommerceDbContext _db;
    public GetFaqItemsQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<FaqItemDto>> Handle(GetFaqItemsQuery r, CancellationToken ct)
    {
        var q = _db.FaqItems.AsNoTracking().Where(f => !f.IsDeleted);
        if (!r.IncludeInactive) q = q.Where(f => f.IsActive);
        if (!string.IsNullOrWhiteSpace(r.Category))
            q = q.Where(f => f.Category == r.Category);
        return await q.OrderBy(f => f.SortOrder)
            .Select(f => new FaqItemDto(f.Id, f.Question, f.Answer, f.Category, f.SortOrder, f.IsActive, f.CreatedAt))
            .ToListAsync(ct);
    }
}
