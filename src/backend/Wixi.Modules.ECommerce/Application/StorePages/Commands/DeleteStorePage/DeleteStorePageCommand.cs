using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Enums;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StorePages.Commands.DeleteStorePage;

public record DeleteStorePageCommand(Guid PageId) : IRequest<bool>;

public class DeleteStorePageCommandHandler : IRequestHandler<DeleteStorePageCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public DeleteStorePageCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(DeleteStorePageCommand request, CancellationToken ct)
    {
        var page = await _db.StorePages
            .FirstOrDefaultAsync(p => p.Id == request.PageId && !p.IsDeleted, ct)
            ?? throw new KeyNotFoundException($"Sayfa bulunamadı: {request.PageId}");

        if (page.PageType == StorePageType.Home)
            throw new InvalidOperationException("Ana sayfa silinemez.");

        page.IsDeleted = true;
        page.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
