using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Customers.Queries.GetCurrentCustomer;

public record CustomerDto(Guid Id, string Email, string FirstName, string LastName, string? PhoneNumber);

public record GetCurrentCustomerQuery(Guid CustomerId) : IRequest<CustomerDto?>;

public class GetCurrentCustomerQueryHandler : IRequestHandler<GetCurrentCustomerQuery, CustomerDto?>
{
    private readonly ECommerceDbContext _db;

    public GetCurrentCustomerQueryHandler(ECommerceDbContext db) => _db = db;

    public async Task<CustomerDto?> Handle(GetCurrentCustomerQuery request, CancellationToken ct)
    {
        var c = await _db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.CustomerId && !x.IsDeleted, ct);

        if (c == null) return null;

        return new CustomerDto(c.Id, c.Email, c.FirstName, c.LastName, c.PhoneNumber);
    }
}
