using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Testimonials;

// ─── DTOs ──────────────────────────────────────────────────────────
public record TestimonialDto(
    Guid Id,
    string CustomerName,
    string? CustomerTitle,
    string? CustomerAvatarUrl,
    string Quote,
    int Rating,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt);

// ─── Commands ──────────────────────────────────────────────────────
public record CreateTestimonialCommand(
    string CustomerName,
    string? CustomerTitle,
    string? CustomerAvatarUrl,
    string Quote,
    int Rating,
    int SortOrder) : IRequest<Guid>;

public record UpdateTestimonialCommand(
    Guid Id,
    string CustomerName,
    string? CustomerTitle,
    string? CustomerAvatarUrl,
    string Quote,
    int Rating,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public record DeleteTestimonialCommand(Guid Id) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetTestimonialsQuery(bool IncludeInactive = false)
    : IRequest<IReadOnlyList<TestimonialDto>>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreateTestimonialCommandHandler : IRequestHandler<CreateTestimonialCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreateTestimonialCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreateTestimonialCommand r, CancellationToken ct)
    {
        var entity = new WixiTestimonial
        {
            CustomerName = r.CustomerName,
            CustomerTitle = r.CustomerTitle,
            CustomerAvatarUrl = r.CustomerAvatarUrl,
            Quote = r.Quote,
            Rating = r.Rating,
            SortOrder = r.SortOrder
        };
        _db.Testimonials.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.Id;
    }
}

public class UpdateTestimonialCommandHandler : IRequestHandler<UpdateTestimonialCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public UpdateTestimonialCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(UpdateTestimonialCommand r, CancellationToken ct)
    {
        var entity = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == r.Id && !t.IsDeleted, ct);
        if (entity is null) return false;
        entity.CustomerName = r.CustomerName;
        entity.CustomerTitle = r.CustomerTitle;
        entity.CustomerAvatarUrl = r.CustomerAvatarUrl;
        entity.Quote = r.Quote;
        entity.Rating = r.Rating;
        entity.SortOrder = r.SortOrder;
        entity.IsActive = r.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteTestimonialCommandHandler : IRequestHandler<DeleteTestimonialCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteTestimonialCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteTestimonialCommand r, CancellationToken ct)
    {
        var entity = await _db.Testimonials.FirstOrDefaultAsync(t => t.Id == r.Id && !t.IsDeleted, ct);
        if (entity is null) return false;
        entity.IsDeleted = true; entity.IsActive = false; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetTestimonialsQueryHandler : IRequestHandler<GetTestimonialsQuery, IReadOnlyList<TestimonialDto>>
{
    private readonly ECommerceDbContext _db;
    public GetTestimonialsQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<TestimonialDto>> Handle(GetTestimonialsQuery r, CancellationToken ct)
    {
        var q = _db.Testimonials.AsNoTracking().Where(t => !t.IsDeleted);
        if (!r.IncludeInactive) q = q.Where(t => t.IsActive);
        return await q.OrderBy(t => t.SortOrder)
            .Select(t => new TestimonialDto(t.Id, t.CustomerName, t.CustomerTitle,
                t.CustomerAvatarUrl, t.Quote, t.Rating, t.SortOrder, t.IsActive, t.CreatedAt))
            .ToListAsync(ct);
    }
}
