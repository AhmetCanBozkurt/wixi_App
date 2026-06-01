using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.PromoBanners;

// ─── DTOs ──────────────────────────────────────────────────────────
public record PromoBannerDto(
    Guid Id,
    string Title,
    string? Subtitle,
    string? ImageUrl,
    string? ButtonText,
    string? ButtonUrl,
    string? BackgroundColor,
    string? TextColor,
    string Layout,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt);

// ─── Commands ──────────────────────────────────────────────────────
public record CreatePromoBannerCommand(
    string Title,
    string? Subtitle,
    string? ImageUrl,
    string? ButtonText,
    string? ButtonUrl,
    string? BackgroundColor,
    string? TextColor,
    string Layout,
    int SortOrder) : IRequest<Guid>;

public record UpdatePromoBannerCommand(
    Guid Id,
    string Title,
    string? Subtitle,
    string? ImageUrl,
    string? ButtonText,
    string? ButtonUrl,
    string? BackgroundColor,
    string? TextColor,
    string Layout,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public record DeletePromoBannerCommand(Guid Id) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetPromoBannersQuery(bool IncludeInactive = false)
    : IRequest<IReadOnlyList<PromoBannerDto>>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreatePromoBannerCommandHandler : IRequestHandler<CreatePromoBannerCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreatePromoBannerCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreatePromoBannerCommand r, CancellationToken ct)
    {
        var entity = new WixiPromoBanner
        {
            Title = r.Title,
            Subtitle = r.Subtitle,
            ImageUrl = r.ImageUrl,
            ButtonText = r.ButtonText,
            ButtonUrl = r.ButtonUrl,
            BackgroundColor = r.BackgroundColor,
            TextColor = r.TextColor,
            Layout = r.Layout,
            SortOrder = r.SortOrder
        };
        _db.PromoBanners.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.Id;
    }
}

public class UpdatePromoBannerCommandHandler : IRequestHandler<UpdatePromoBannerCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public UpdatePromoBannerCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(UpdatePromoBannerCommand r, CancellationToken ct)
    {
        var entity = await _db.PromoBanners.FirstOrDefaultAsync(b => b.Id == r.Id && !b.IsDeleted, ct);
        if (entity is null) return false;
        entity.Title = r.Title;
        entity.Subtitle = r.Subtitle;
        entity.ImageUrl = r.ImageUrl;
        entity.ButtonText = r.ButtonText;
        entity.ButtonUrl = r.ButtonUrl;
        entity.BackgroundColor = r.BackgroundColor;
        entity.TextColor = r.TextColor;
        entity.Layout = r.Layout;
        entity.SortOrder = r.SortOrder;
        entity.IsActive = r.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeletePromoBannerCommandHandler : IRequestHandler<DeletePromoBannerCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeletePromoBannerCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeletePromoBannerCommand r, CancellationToken ct)
    {
        var entity = await _db.PromoBanners.FirstOrDefaultAsync(b => b.Id == r.Id && !b.IsDeleted, ct);
        if (entity is null) return false;
        entity.IsDeleted = true; entity.IsActive = false; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetPromoBannersQueryHandler : IRequestHandler<GetPromoBannersQuery, IReadOnlyList<PromoBannerDto>>
{
    private readonly ECommerceDbContext _db;
    public GetPromoBannersQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<PromoBannerDto>> Handle(GetPromoBannersQuery r, CancellationToken ct)
    {
        var q = _db.PromoBanners.AsNoTracking().Where(b => !b.IsDeleted);
        if (!r.IncludeInactive) q = q.Where(b => b.IsActive);
        return await q.OrderBy(b => b.SortOrder)
            .Select(b => new PromoBannerDto(b.Id, b.Title, b.Subtitle, b.ImageUrl, b.ButtonText,
                b.ButtonUrl, b.BackgroundColor, b.TextColor, b.Layout, b.SortOrder, b.IsActive, b.CreatedAt))
            .ToListAsync(ct);
    }
}
