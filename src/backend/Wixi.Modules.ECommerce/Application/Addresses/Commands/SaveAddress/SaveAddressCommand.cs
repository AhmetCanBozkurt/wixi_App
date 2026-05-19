using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Addresses.Commands.SaveAddress;

public record SaveAddressCommand(
    Guid? Id,
    Guid CustomerId,
    AddressType AddressType,
    string Title,
    string FirstName,
    string LastName,
    string Phone,
    string AddressLine,
    string City,
    string District,
    string? ZipCode,
    bool IsDefault
) : IRequest<Guid>;

public class SaveAddressCommandHandler : IRequestHandler<SaveAddressCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public SaveAddressCommandHandler(ECommerceDbContext db) => _db = db;

    public async Task<Guid> Handle(SaveAddressCommand request, CancellationToken ct)
    {
        if (request.IsDefault)
        {
            await _db.Addresses
                .Where(a => a.CustomerId == request.CustomerId
                         && a.AddressType == request.AddressType
                         && !a.IsDeleted
                         && a.Id != request.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.IsDefault, false), ct);
        }

        if (request.Id is null)
        {
            var address = new WixiAddress
            {
                CustomerId = request.CustomerId,
                AddressType = request.AddressType,
                Title = request.Title,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                AddressLine = request.AddressLine,
                City = request.City,
                District = request.District,
                ZipCode = request.ZipCode,
                IsDefault = request.IsDefault,
                CreatedAt = DateTime.UtcNow
            };

            _db.Addresses.Add(address);
            await _db.SaveChangesAsync(ct);
            return address.Id;
        }

        await _db.Addresses
            .Where(a => a.Id == request.Id && a.CustomerId == request.CustomerId && !a.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(a => a.AddressType, request.AddressType)
                .SetProperty(a => a.Title, request.Title)
                .SetProperty(a => a.FirstName, request.FirstName)
                .SetProperty(a => a.LastName, request.LastName)
                .SetProperty(a => a.Phone, request.Phone)
                .SetProperty(a => a.AddressLine, request.AddressLine)
                .SetProperty(a => a.City, request.City)
                .SetProperty(a => a.District, request.District)
                .SetProperty(a => a.ZipCode, request.ZipCode)
                .SetProperty(a => a.IsDefault, request.IsDefault)
                .SetProperty(a => a.UpdatedAt, DateTime.UtcNow),
            ct);

        return request.Id.Value;
    }
}
