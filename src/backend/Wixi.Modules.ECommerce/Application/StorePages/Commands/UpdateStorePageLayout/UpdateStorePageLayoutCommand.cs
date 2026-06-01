using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Commands.UpdateStorePageLayout;

public record UpdateStorePageLayoutCommand(
    Guid PageId,
    string? LayoutConfigJson,
    string? ThemeOverrideJson = null) : IRequest<bool>;

public class UpdateStorePageLayoutCommandHandler : IRequestHandler<UpdateStorePageLayoutCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateStorePageLayoutCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateStorePageLayoutCommand request, CancellationToken ct)
    {
        var page = await _db.StorePages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.LayoutConfigJson = request.LayoutConfigJson;

        if (request.ThemeOverrideJson != null)
            page.ThemeOverrideJson = request.ThemeOverrideJson;

        page.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
