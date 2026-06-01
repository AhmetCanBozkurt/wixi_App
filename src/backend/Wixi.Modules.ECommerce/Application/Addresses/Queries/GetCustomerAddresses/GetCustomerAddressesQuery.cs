using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Addresses.Queries.GetCustomerAddresses;

public record AddressDto(
    Guid Id,
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
);

public record GetCustomerAddressesQuery(Guid CustomerId) : IRequest<IReadOnlyList<AddressDto>>;

public class GetCustomerAddressesQueryHandler
    : IRequestHandler<GetCustomerAddressesQuery, IReadOnlyList<AddressDto>>
{
    private readonly ECommerceDbContext _db;

    public GetCustomerAddressesQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<IReadOnlyList<AddressDto>> Handle(
        GetCustomerAddressesQuery request, CancellationToken ct)
    {
        return await _db.Addresses
            .AsNoTracking()
            .Where(a => a.CustomerId == request.CustomerId && !a.IsDeleted)
            .OrderByDescending(a => a.IsDefault)
            .ThenBy(a => a.CreatedAt)
            .Select(a => new AddressDto(
                a.Id,
                a.AddressType,
                a.Title,
                a.FirstName,
                a.LastName,
                a.Phone,
                a.AddressLine,
                a.City,
                a.District,
                a.ZipCode,
                a.IsDefault))
            .ToListAsync(ct);
    }
}
