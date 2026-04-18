using System.Security.Cryptography;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Auth.Services;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Auth.Commands.ResendTwoFactor;

public class ResendTwoFactorCommandHandler : IRequestHandler<ResendTwoFactorCommand, AuthResult>
{
    private readonly WixiCoreDbContext _dbContext;
    private readonly UserManager<WixiUser> _userManager;
    private readonly IMailService _mailService;
    private readonly IOtpPepperProvider _otpPepper;
    private readonly AuthSecurityOptions _authSecurity;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ResendTwoFactorCommandHandler(
        WixiCoreDbContext dbContext,
        UserManager<WixiUser> userManager,
        IMailService mailService,
        IOtpPepperProvider otpPepper,
        IOptions<AuthSecurityOptions> authSecurity,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _mailService = mailService;
        _otpPepper = otpPepper;
        _authSecurity = authSecurity.Value;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResult> Handle(ResendTwoFactorCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TwoFactorToken))
            return new AuthResult { Success = false, ErrorMessage = "2FA token zorunludur." };

        var record = await _dbContext.TwoFactorCodes
            .FirstOrDefaultAsync(x => x.SessionToken == request.TwoFactorToken, cancellationToken);

        if (record == null || record.IsUsed)
            return new AuthResult { Success = false, ErrorMessage = "2FA oturumu geçersiz." };

        if (record.ExpiresAt <= DateTime.UtcNow)
            return new AuthResult { Success = false, ErrorMessage = "2FA oturumu süresi doldu. Lütfen tekrar giriş yapın." };

        var cooldown = _authSecurity.TwoFactorResendCooldownSeconds <= 0 ? 60 : _authSecurity.TwoFactorResendCooldownSeconds;
        if (record.LastResendAtUtc.HasValue)
        {
            var elapsed = DateTime.UtcNow - record.LastResendAtUtc.Value;
            if (elapsed.TotalSeconds < cooldown)
            {
                var wait = (int)Math.Ceiling(cooldown - elapsed.TotalSeconds);
                return new AuthResult
                {
                    Success = false,
                    ErrorMessage = $"Yeni kod için {wait} saniye bekleyin."
                };
            }
        }

        var user = await _userManager.FindByIdAsync(record.UserId.ToString());
        if (user == null)
            return new AuthResult { Success = false, ErrorMessage = "Kullanıcı bulunamadı." };

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var salt = OtpHasher.CreateSalt();
        var hash = OtpHasher.Hash(_otpPepper.Pepper, record.SessionToken, code, salt);

        record.CodeHash = hash;
        record.CodeSalt = salt;
        record.AttemptCount = 0;
        record.ExpiresAt = DateTime.UtcNow.AddMinutes(5);
        record.LastResendAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _mailService.SendWithTemplateAsync(
            "TWO_FACTOR_AUTH",
            user.Email!,
            new { fullName = $"{user.FirstName} {user.LastName}", code },
            cancellationToken);

        var http = _httpContextAccessor.HttpContext;
        var ip = http?.Connection.RemoteIpAddress?.ToString();
        var ua = http?.Request.Headers["User-Agent"].ToString();
        await _dbContext.LogSecurityEventAsync(
            "TWOFA_RESEND",
            "2FA OTP yeniden gönderildi.",
            user.Id.ToString(),
            user.Email,
            $"{user.FirstName} {user.LastName}",
            ip,
            ua,
            cancellationToken);

        return new AuthResult { Success = true };
    }
}
