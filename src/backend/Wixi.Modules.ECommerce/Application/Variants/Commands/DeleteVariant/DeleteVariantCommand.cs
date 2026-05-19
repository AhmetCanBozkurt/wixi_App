using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Variants.Commands.DeleteVariant;

public record DeleteVariantCommand(Guid Id) : IRequest<bool>;

public class DeleteVariantCommandHandler : IRequestHandler<DeleteVariantCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public DeleteVariantCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(DeleteVariantCommand request, CancellationToken ct)
    {
        var rows = await _db.ProductVariants
            .Where(v => v.Id == request.Id && !v.IsDeleted)
            .ExecuteUpdateAsync(s => s.SetProperty(v => v.IsDeleted, true), ct);

        return rows > 0;
    }
}
