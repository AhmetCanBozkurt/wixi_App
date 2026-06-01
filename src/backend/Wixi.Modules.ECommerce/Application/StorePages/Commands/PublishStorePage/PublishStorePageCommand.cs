using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Commands.PublishStorePage;

public record PublishStorePageCommand(Guid PageId, bool IsPublished) : IRequest<bool>;

public class PublishStorePageCommandHandler : IRequestHandler<PublishStorePageCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public PublishStorePageCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(PublishStorePageCommand request, CancellationToken ct)
    {
        var page = await _db.StorePages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.IsPublished = request.IsPublished;
        page.PublishedAt = request.IsPublished ? DateTime.UtcNow : null;
        page.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
