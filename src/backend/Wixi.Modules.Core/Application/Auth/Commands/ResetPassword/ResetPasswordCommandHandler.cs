using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly WixiCoreDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ResetPasswordCommandHandler(
        UserManager<WixiUser> userManager,
        WixiCoreDbContext dbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResult> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var http = _httpContextAccessor.HttpContext;
        var ip = http?.Connection.RemoteIpAddress?.ToString();
        var ua = http?.Request.Headers["User-Agent"].ToString();

        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Token) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return new AuthResult { Success = false, ErrorMessage = "Email, token ve yeni şifre zorunludur." };
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            await _dbContext.LogSecurityEventAsync(
                "RESET_PASSWORD_FAILED",
                "Bilinmeyen e-posta veya geçersiz token.",
                null,
                null,
                null,
                ip,
                ua,
                cancellationToken);
            return new AuthResult
            {
                Success = false,
                ErrorMessage = "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."
            };
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var isInvalidToken = result.Errors.Any(e =>
                string.Equals(e.Code, "InvalidToken", StringComparison.OrdinalIgnoreCase));

            await _dbContext.LogSecurityEventAsync(
                "RESET_PASSWORD_FAILED",
                isInvalidToken ? "Geçersiz veya süresi dolmuş token." : string.Join(" | ", result.Errors.Select(e => e.Code)),
                user.Id.ToString(),
                user.Email,
                $"{user.FirstName} {user.LastName}",
                ip,
                ua,
                cancellationToken);

            if (isInvalidToken)
            {
                return new AuthResult
                {
                    Success = false,
                    ErrorMessage = "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş."
                };
            }

            var msg = string.Join(" | ", result.Errors.Select(e => e.Description));
            return new AuthResult { Success = false, ErrorMessage = msg };
        }

        await _dbContext.LogSecurityEventAsync(
            "RESET_PASSWORD_SUCCESS",
            "Şifre sıfırlama tamamlandı.",
            user.Id.ToString(),
            user.Email,
            $"{user.FirstName} {user.LastName}",
            ip,
            ua,
            cancellationToken);

        return new AuthResult { Success = true };
    }
}
