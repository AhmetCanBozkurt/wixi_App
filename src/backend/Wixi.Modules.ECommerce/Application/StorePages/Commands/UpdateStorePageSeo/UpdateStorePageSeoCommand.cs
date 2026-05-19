using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Commands.UpdateStorePageSeo;

public record UpdateStorePageSeoCommand(
    Guid PageId,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string? OpenGraphImageUrl) : IRequest<bool>;

public class UpdateStorePageSeoCommandHandler : IRequestHandler<UpdateStorePageSeoCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateStorePageSeoCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateStorePageSeoCommand request, CancellationToken ct)
    {
        var page = await _db.StorePages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.MetaTitle = request.MetaTitle;
        page.MetaDescription = request.MetaDescription;
        page.MetaKeywords = request.MetaKeywords;
        page.OpenGraphImageUrl = request.OpenGraphImageUrl;
        page.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
