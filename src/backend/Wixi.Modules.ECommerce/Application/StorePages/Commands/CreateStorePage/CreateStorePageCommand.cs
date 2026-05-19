using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.StorePages.Dto;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Domain.Enums;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Commands.CreateStorePage;

public record CreateStorePageCommand(
    string Title,
    string Slug,
    StorePageType PageType = StorePageType.Custom) : IRequest<StorePageDto>;

public class CreateStorePageCommandHandler : IRequestHandler<CreateStorePageCommand, StorePageDto>
{
    private readonly ECommerceDbContext _db;

    public CreateStorePageCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<StorePageDto> Handle(CreateStorePageCommand request, CancellationToken ct)
    {
        var slug = request.Slug.ToLowerInvariant().Trim();

        var slugExists = await _db.StorePages
            .AnyAsync(p => p.Slug == slug && !p.IsDeleted, ct);

        if (slugExists)
            throw new InvalidOperationException($"'{slug}' slug'ı zaten kullanımda.");

        var page = new WixiStorePage
        {
            Id = Guid.NewGuid(),
            PageType = request.PageType,
            Slug = slug,
            Title = request.Title,
            IsPublished = false,
            IsActive = true,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
        };

        _db.StorePages.Add(page);
        await _db.SaveChangesAsync(ct);

        return new StorePageDto
        {
            Id = page.Id,
            PageType = page.PageType,
            Slug = page.Slug,
            Title = page.Title,
            IsPublished = page.IsPublished,
            CreatedAt = page.CreatedAt,
        };
    }
}
