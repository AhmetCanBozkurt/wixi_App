using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly WixiCoreDbContext _context;

    public RegisterCommandHandler(UserManager<WixiUser> userManager, WixiCoreDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<AuthResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            return new AuthResult { Success = false, ErrorMessage = "Bu e-posta adresi zaten kullanılıyor." };
        }

        Guid? tenantId = null;
        if (!string.IsNullOrEmpty(request.TenantSlug))
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Slug == request.TenantSlug, cancellationToken);
            tenantId = tenant?.Id;
        }

        var newUser = new WixiUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true, // İleride e-posta doğrulama eklenebilir
            TenantId = tenantId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(newUser, request.Password);
        
        if (!result.Succeeded)
        {
            return new AuthResult { Success = false, ErrorMessage = string.Join(", ", result.Errors.Select(e => e.Description)) };
        }

        // Otomatik "Normal" rolü atama
        await _userManager.AddToRoleAsync(newUser, "Normal");

        return new AuthResult { Success = true, UserId = newUser.Id.ToString() };
    }
}
