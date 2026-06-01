using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.Customers.Commands.UpdateCustomerProfile;

public record UpdateCustomerProfileCommand(
    Guid CustomerId,
    string FirstName,
    string LastName,
    string? PhoneNumber
) : IRequest<Unit>;

public class UpdateCustomerProfileCommandHandler : IRequestHandler<UpdateCustomerProfileCommand, Unit>
{
    private readonly ECommerceDbContext _db;

    public UpdateCustomerProfileCommandHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateCustomerProfileCommand request, CancellationToken ct)
    {
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId && !c.IsDeleted, ct);

        if (customer == null)
            throw new InvalidOperationException("Müşteri bulunamadı.");

        if (string.IsNullOrWhiteSpace(request.FirstName))
            throw new ArgumentException("Ad boş olamaz.");

        if (string.IsNullOrWhiteSpace(request.LastName))
            throw new ArgumentException("Soyad boş olamaz.");

        customer.FirstName = request.FirstName;
        customer.LastName = request.LastName;
        customer.PhoneNumber = request.PhoneNumber;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return Unit.Value;
    }
}
