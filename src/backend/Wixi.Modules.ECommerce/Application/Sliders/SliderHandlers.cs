using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Sliders;

// ─── DTOs ──────────────────────────────────────────────────────────
public record SliderSlideDto(
    Guid Id,
    Guid SliderId,
    string? Title,
    string? Subtitle,
    string ImageUrl,
    string? ButtonText,
    string? ButtonUrl,
    int SortOrder);

public record SliderDto(
    Guid Id,
    string Name,
    bool AutoPlay,
    int AutoPlayInterval,
    bool ShowDots,
    bool ShowArrows,
    bool IsActive,
    DateTime CreatedAt,
    List<SliderSlideDto> Slides);

// ─── Commands ──────────────────────────────────────────────────────
public record CreateSliderCommand(
    string Name,
    bool AutoPlay,
    int AutoPlayInterval,
    bool ShowDots,
    bool ShowArrows) : IRequest<Guid>;

public record UpdateSliderCommand(
    Guid Id,
    string Name,
    bool AutoPlay,
    int AutoPlayInterval,
    bool ShowDots,
    bool ShowArrows,
    bool IsActive) : IRequest<bool>;

public record DeleteSliderCommand(Guid Id) : IRequest<bool>;

public record AddSlideCommand(
    Guid SliderId,
    string? Title,
    string? Subtitle,
    string ImageUrl,
    string? ButtonText,
    string? ButtonUrl,
    int SortOrder) : IRequest<Guid>;

public record DeleteSlideCommand(Guid SlideId) : IRequest<bool>;

// ─── Queries ───────────────────────────────────────────────────────
public record GetSlidersQuery(bool IncludeInactive = false)
    : IRequest<IReadOnlyList<SliderDto>>;

public record GetSliderByIdQuery(Guid Id) : IRequest<SliderDto?>;

// ─── Handlers ──────────────────────────────────────────────────────
public class CreateSliderCommandHandler : IRequestHandler<CreateSliderCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public CreateSliderCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(CreateSliderCommand r, CancellationToken ct)
    {
        var entity = new WixiSlider
        {
            Name = r.Name,
            AutoPlay = r.AutoPlay,
            AutoPlayInterval = r.AutoPlayInterval,
            ShowDots = r.ShowDots,
            ShowArrows = r.ShowArrows
        };
        _db.Sliders.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.Id;
    }
}

public class UpdateSliderCommandHandler : IRequestHandler<UpdateSliderCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public UpdateSliderCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(UpdateSliderCommand r, CancellationToken ct)
    {
        var entity = await _db.Sliders.FirstOrDefaultAsync(s => s.Id == r.Id && !s.IsDeleted, ct);
        if (entity is null) return false;
        entity.Name = r.Name;
        entity.AutoPlay = r.AutoPlay;
        entity.AutoPlayInterval = r.AutoPlayInterval;
        entity.ShowDots = r.ShowDots;
        entity.ShowArrows = r.ShowArrows;
        entity.IsActive = r.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class DeleteSliderCommandHandler : IRequestHandler<DeleteSliderCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteSliderCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteSliderCommand r, CancellationToken ct)
    {
        var entity = await _db.Sliders.FirstOrDefaultAsync(s => s.Id == r.Id && !s.IsDeleted, ct);
        if (entity is null) return false;
        entity.IsDeleted = true; entity.IsActive = false; entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class AddSlideCommandHandler : IRequestHandler<AddSlideCommand, Guid>
{
    private readonly ECommerceDbContext _db;
    public AddSlideCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<Guid> Handle(AddSlideCommand r, CancellationToken ct)
    {
        var slide = new WixiSliderSlide
        {
            SliderId = r.SliderId,
            Title = r.Title,
            Subtitle = r.Subtitle,
            ImageUrl = r.ImageUrl,
            ButtonText = r.ButtonText,
            ButtonUrl = r.ButtonUrl,
            SortOrder = r.SortOrder
        };
        _db.SliderSlides.Add(slide);
        await _db.SaveChangesAsync(ct);
        return slide.Id;
    }
}

public class DeleteSlideCommandHandler : IRequestHandler<DeleteSlideCommand, bool>
{
    private readonly ECommerceDbContext _db;
    public DeleteSlideCommandHandler(ECommerceDbContext db) => _db = db;
    public async Task<bool> Handle(DeleteSlideCommand r, CancellationToken ct)
    {
        var slide = await _db.SliderSlides.FirstOrDefaultAsync(s => s.Id == r.SlideId && !s.IsDeleted, ct);
        if (slide is null) return false;
        slide.IsDeleted = true; slide.IsActive = false; slide.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}

public class GetSlidersQueryHandler : IRequestHandler<GetSlidersQuery, IReadOnlyList<SliderDto>>
{
    private readonly ECommerceDbContext _db;
    public GetSlidersQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<IReadOnlyList<SliderDto>> Handle(GetSlidersQuery r, CancellationToken ct)
    {
        var q = _db.Sliders.AsNoTracking()
            .Include(s => s.Slides.Where(sl => !sl.IsDeleted))
            .Where(s => !s.IsDeleted);
        if (!r.IncludeInactive) q = q.Where(s => s.IsActive);
        return await q.OrderBy(s => s.Name)
            .Select(s => new SliderDto(
                s.Id, s.Name, s.AutoPlay, s.AutoPlayInterval, s.ShowDots, s.ShowArrows,
                s.IsActive, s.CreatedAt,
                s.Slides.OrderBy(sl => sl.SortOrder)
                    .Select(sl => new SliderSlideDto(sl.Id, sl.SliderId, sl.Title, sl.Subtitle,
                        sl.ImageUrl, sl.ButtonText, sl.ButtonUrl, sl.SortOrder))
                    .ToList()))
            .ToListAsync(ct);
    }
}

public class GetSliderByIdQueryHandler : IRequestHandler<GetSliderByIdQuery, SliderDto?>
{
    private readonly ECommerceDbContext _db;
    public GetSliderByIdQueryHandler(ECommerceDbContext db) => _db = db;
    public async Task<SliderDto?> Handle(GetSliderByIdQuery r, CancellationToken ct)
    {
        var s = await _db.Sliders.AsNoTracking()
            .Include(sl => sl.Slides.Where(slide => !slide.IsDeleted))
            .FirstOrDefaultAsync(sl => sl.Id == r.Id && !sl.IsDeleted, ct);
        if (s is null) return null;
        return new SliderDto(
            s.Id, s.Name, s.AutoPlay, s.AutoPlayInterval, s.ShowDots, s.ShowArrows,
            s.IsActive, s.CreatedAt,
            s.Slides.OrderBy(sl => sl.SortOrder)
                .Select(sl => new SliderSlideDto(sl.Id, sl.SliderId, sl.Title, sl.Subtitle,
                    sl.ImageUrl, sl.ButtonText, sl.ButtonUrl, sl.SortOrder))
                .ToList());
    }
}
