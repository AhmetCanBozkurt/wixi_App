using MediatR;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Application.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;

    public ResetPasswordCommandHandler(UserManager<WixiUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<AuthResult> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Token) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return new AuthResult { Success = false, ErrorMessage = "Email, token ve yeni şifre zorunludur." };
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return new AuthResult { Success = false, ErrorMessage = "Kullanıcı bulunamadı." };

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var msg = string.Join(" | ", result.Errors.Select(e => e.Description));
            return new AuthResult { Success = false, ErrorMessage = msg };
        }

        return new AuthResult { Success = true };
    }
}

