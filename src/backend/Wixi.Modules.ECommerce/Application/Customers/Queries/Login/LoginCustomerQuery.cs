using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;
using Wixi.Shared.Configuration;
using BCrypt.Net;

namespace Wixi.Modules.ECommerce.Application.Customers.Queries.Login;

public record LoginCustomerResult(Guid CustomerId, string FirstName, string LastName, string Email, string Token);

public record LoginCustomerQuery(string Email, string Password) : IRequest<LoginCustomerResult?>;

public class LoginCustomerQueryHandler : IRequestHandler<LoginCustomerQuery, LoginCustomerResult?>
{
    private readonly ECommerceDbContext _db;
    private readonly JwtOptions _jwtOptions;

    public LoginCustomerQueryHandler(ECommerceDbContext db, IOptions<JwtOptions> jwtOptions)
    {
        _db = db;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<LoginCustomerResult?> Handle(LoginCustomerQuery request, CancellationToken ct)
    {
        var customer = await _db.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Email.ToLower() == request.Email.ToLower() && !c.IsDeleted && c.IsActive, ct);

        if (customer == null)
            return null;

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash);
        
        if (!isPasswordValid)
            return null;

        var token = GenerateJwtToken(customer);

        return new LoginCustomerResult(customer.Id, customer.FirstName, customer.LastName, customer.Email, token);
    }

    private string GenerateJwtToken(WixiCustomer customer)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtOptions.SecretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new Claim(ClaimTypes.Email, customer.Email),
            new Claim(ClaimTypes.Name, $"{customer.FirstName} {customer.LastName}"),
            new Claim(ClaimTypes.Role, "StoreCustomer") // Critical: Role is different
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            Issuer = _jwtOptions.Issuer,
            // Audience should ideally be Storefront
            Audience = "Wixi.Storefront",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
