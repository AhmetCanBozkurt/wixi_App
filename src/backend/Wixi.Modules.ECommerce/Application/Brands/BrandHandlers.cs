using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Brands;

// ─── DTOs ──────────────────────────────────────────────────────────
public record BrandDto(Guid Id, string Name, string Slug, string? Description, string? LogoUrl,
    string? WebsiteUrl, bool IsActive, DateTime CreatedAt, string? CreatedByUser, DateTime? UpdatedAt, string? UpdatedByUser);

// ─── Commands ──────────────────────────────────────────────────────
public record CreateBrandCommand(string Name, string Slug, string? Description,
    string? LogoUrl, string? WebsiteUrl) : IRequest<Guid>;

public record UpdateBrandCommand(Guid Id, string Name, string Slug, string? Description,
    string? LogoUrl, string? WebsiteUrl, bool IsActive) : IRequest<bool>;

public record DeleteBrandCommand(Guid Id) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetBrandsQuery(string? Search = null, bool IncludeInactive = false)
    : IRequest<IReadOnlyList<BrandDto>>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreateBrandCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreateBrandCommand r, CancellationToken ct)
    {
        var brand = new WixiBrand { Name = r.Name, Slug = r.Slug, Description = r.Description,
            LogoUrl = r.LogoUrl, WebsiteUrl = r.WebsiteUrl };
        _db.Brands.Add(brand);
        await _db.SaveChangesAsync(ct);
        return brand.Id;
    }
}

public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public UpdateBrandCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(UpdateBrandCommand r, CancellationToken ct)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == r.Id && !b.IsDeleted, ct);
        if (brand is null) return false;
        brand.Name = r.Name; brand.Slug = r.Slug; brand.Description = r.Description;
        brand.LogoUrl = r.LogoUrl; brand.WebsiteUrl = r.WebsiteUrl; brand.IsActive = r.IsActive;
        brand.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteBrandCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteBrandCommand r, CancellationToken ct)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == r.Id && !b.IsDeleted, ct);
        if (brand is null) return false;
        brand.IsDeleted = true; brand.IsActive = false; brand.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetBrandsQueryHandler : IRequestHandler<GetBrandsQuery, IReadOnlyList<BrandDto>>
{
    private readonly ECommerceDbContext _db;
    public GetBrandsQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<BrandDto>> Handle(GetBrandsQuery r, CancellationToken ct)
    {
        var q = _db.Brands.AsNoTracking().Where(b => !b.IsDeleted);
        if (!r.IncludeInactive) q = q.Where(b => b.IsActive);
        if (!string.IsNullOrWhiteSpace(r.Search))
        { var s = r.Search.ToLower(); q = q.Where(b => b.Name.ToLower().Contains(s)); }
        return await q.OrderBy(b => b.Name)
            .Select(b => new BrandDto(b.Id, b.Name, b.Slug, b.Description, b.LogoUrl,
                b.WebsiteUrl, b.IsActive, b.CreatedAt, b.CreatedByUser, b.UpdatedAt, b.UpdatedByUser))
            .ToListAsync(ct);
    }
}
