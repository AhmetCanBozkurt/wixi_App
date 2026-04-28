using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using BCrypt.Net;

namespace Wixi.Modules.ECommerce.Application.Customers.Commands.Register;

public record RegisterCustomerCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password
) : IRequest<Guid>;

public class RegisterCustomerCommandHandler : IRequestHandler<RegisterCustomerCommand, Guid>
{
    private readonly ECommerceDbContext _db;

    public RegisterCustomerCommandHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<Guid> Handle(RegisterCustomerCommand request, CancellationToken ct)
    {
        // 1. Check if email already exists
        var exists = await _db.Customers.AnyAsync(c => c.Email.ToLower() == request.Email.ToLower(), ct);
        if (exists)
        {
            throw new Exception("Bu e-posta adresi ile zaten bir hesap mevcut."); // TODO: Use proper custom exception
        }

        // 2. Hash password (using simple BCrypt for this example)
        // Note: For a real app, use Microsoft.AspNetCore.Identity.PasswordHasher or BCrypt.Net
        // Let's assume BCrypt is available or we will do a basic hashing.
        // I will use BCrypt.Net-Next since it's standard.
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Create customer
        var customer = new WixiCustomer
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email.ToLower(),
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync(ct);

        return customer.Id;
    }
}
