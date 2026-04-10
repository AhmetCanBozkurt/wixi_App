using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;

    public RegisterCommandHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<AuthResult> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            return new AuthResult { Success = false, ErrorMessage = "Bu e-posta adresi zaten kullanılıyor." };
        }

        var newUser = new WixiUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true // İleride e-posta doğrulama eklenebilir
        };

        var result = await _userManager.CreateAsync(newUser, request.Password);
        
        if (!result.Succeeded)
        {
            return new AuthResult { Success = false, ErrorMessage = string.Join(", ", result.Errors.Select(e => e.Description)) };
        }

        // Otomatik "Normal" rolü atama
        await _userManager.AddToRoleAsync(newUser, "Normal");

        return new AuthResult { Success = true };
    }
}
