using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Addresses.Commands.DeleteAddress;

public record DeleteAddressCommand(Guid Id, Guid CustomerId) : IRequest<bool>;

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public DeleteAddressCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<bool> Handle(DeleteAddressCommand request, CancellationToken ct)
    {
        var affected = await _db.Addresses
            .Where(a => a.Id == request.Id && a.CustomerId == request.CustomerId && !a.IsDeleted)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDeleted, true), ct);

        return affected > 0;
    }
}
