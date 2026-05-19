using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Commands.UpdateStorePageBacklinks;

public record UpdateStorePageBacklinksCommand(
    Guid PageId,
    string? BacklinksJson) : IRequest<bool>;

public class UpdateStorePageBacklinksCommandHandler : IRequestHandler<UpdateStorePageBacklinksCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateStorePageBacklinksCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateStorePageBacklinksCommand request, CancellationToken ct)
    {
        var page = await _db.StorePages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        page.BacklinksJson = request.BacklinksJson;
        page.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
