using System.Security.Cryptography;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.ResendTwoFactor;

public class ResendTwoFactorCommandHandler : IRequestHandler<ResendTwoFactorCommand, AuthResult>
{
    private readonly WixiCoreDbContext _dbContext;
    private readonly UserManager<WixiUser> _userManager;
    private readonly IMailService _mailService;

    public ResendTwoFactorCommandHandler(WixiCoreDbContext dbContext, UserManager<WixiUser> userManager, IMailService mailService)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _mailService = mailService;
    }

    public async Task<AuthResult> Handle(ResendTwoFactorCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TwoFactorToken))
            return new AuthResult { Success = false, ErrorMessage = "2FA token zorunludur." };

        var record = await _dbContext.TwoFactorCodes
            .FirstOrDefaultAsync(x => x.SessionToken == request.TwoFactorToken, cancellationToken);

        if (record == null || record.IsUsed)
            return new AuthResult { Success = false, ErrorMessage = "2FA oturumu geçersiz." };

        // If session expired, require re-login (security)
        if (record.ExpiresAt <= DateTime.UtcNow)
            return new AuthResult { Success = false, ErrorMessage = "2FA oturumu süresi doldu. Lütfen tekrar giriş yapın." };

        var user = await _userManager.FindByIdAsync(record.UserId.ToString());
        if (user == null)
            return new AuthResult { Success = false, ErrorMessage = "Kullanıcı bulunamadı." };

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        record.Code = code;
        record.AttemptCount = 0;
        record.ExpiresAt = DateTime.UtcNow.AddMinutes(5);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _mailService.SendWithTemplateAsync(
            "TWO_FACTOR_AUTH",
            user.Email!,
            new { fullName = $"{user.FirstName} {user.LastName}", code },
            cancellationToken);

        return new AuthResult { Success = true };
    }
}

