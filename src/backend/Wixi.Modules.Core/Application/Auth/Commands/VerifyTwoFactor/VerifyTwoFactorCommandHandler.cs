using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Auth.Services;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Auth.Commands.VerifyTwoFactor;

public class VerifyTwoFactorCommandHandler : IRequestHandler<VerifyTwoFactorCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly JwtOptions _jwtOptions;
    private readonly AuthSecurityOptions _authSecurity;
    private readonly WixiCoreDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOtpPepperProvider _otpPepper;
    private readonly IRefreshTokenCookieService _refreshCookie;

    public VerifyTwoFactorCommandHandler(
        UserManager<WixiUser> userManager,
        IOptions<JwtOptions> jwtOptions,
        IOptions<AuthSecurityOptions> authSecurity,
        WixiCoreDbContext dbContext,
        IHttpContextAccessor httpContextAccessor,
        IOtpPepperProvider otpPepper,
        IRefreshTokenCookieService refreshCookie)
    {
        _userManager = userManager;
        _jwtOptions = jwtOptions.Value;
        _authSecurity = authSecurity.Value;
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
        _otpPepper = otpPepper;
        _refreshCookie = refreshCookie;
    }

    public async Task<AuthResult> Handle(VerifyTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var http = _httpContextAccessor.HttpContext;
        var ip = http?.Connection.RemoteIpAddress?.ToString();
        var ua = http?.Request.Headers["User-Agent"].ToString();

        var record = await _dbContext.TwoFactorCodes
            .FirstOrDefaultAsync(x => x.SessionToken == request.TwoFactorToken, cancellationToken);

        if (record == null || record.IsUsed || record.ExpiresAt <= DateTime.UtcNow)
        {
            await _dbContext.LogSecurityEventAsync(
                "TWOFA_VERIFY_FAILED",
                "Geçersiz veya süresi dolmuş 2FA oturumu.",
                null,
                null,
                null,
                ip,
                ua,
                cancellationToken);
            return new AuthResult { Success = false, ErrorMessage = "2FA oturumu geçersiz veya süresi dolmuş." };
        }

        if (record.AttemptCount >= 3)
        {
            await _dbContext.LogSecurityEventAsync(
                "TWOFA_VERIFY_FAILED",
                "Deneme limiti aşıldı.",
                record.UserId.ToString(),
                null,
                null,
                ip,
                ua,
                cancellationToken);
            return new AuthResult { Success = false, ErrorMessage = "Çok fazla deneme yapıldı. Lütfen tekrar giriş yapın." };
        }

        var ok = OtpHasher.Verify(_otpPepper.Pepper, record.SessionToken, request.OtpCode, record.CodeSalt, record.CodeHash);
        if (!ok)
        {
            record.AttemptCount += 1;
            await _dbContext.SaveChangesAsync(cancellationToken);
            await _dbContext.LogSecurityEventAsync(
                "TWOFA_VERIFY_FAILED",
                "OTP eşleşmedi.",
                record.UserId.ToString(),
                null,
                null,
                ip,
                ua,
                cancellationToken);
            return new AuthResult { Success = false, ErrorMessage = "Doğrulama kodu hatalı." };
        }

        record.IsUsed = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var user = await _userManager.FindByIdAsync(record.UserId.ToString());
        if (user == null)
        {
            await _dbContext.LogSecurityEventAsync(
                "TWOFA_VERIFY_FAILED",
                "Kullanıcı bulunamadı.",
                record.UserId.ToString(),
                null,
                null,
                ip,
                ua,
                cancellationToken);
            return new AuthResult { Success = false, ErrorMessage = "Kullanıcı bulunamadı." };
        }

        var accessToken = await GenerateJwtAsync(user);

        if (request.RememberMe)
        {
            await IssueRefreshTokenCookieAsync(user.Id, cancellationToken);
        }

        await _dbContext.LogSecurityEventAsync(
            "TWOFA_VERIFY_SUCCESS",
            "2FA doğrulandı.",
            user.Id.ToString(),
            user.Email,
            $"{user.FirstName} {user.LastName}",
            ip,
            ua,
            cancellationToken);

        return new AuthResult
        {
            Success = true,
            Token = accessToken
        };
    }

    private async Task<string> GenerateJwtAsync(WixiUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtOptions.SecretKey);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
        };

        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryMinutes),
            Issuer = _jwtOptions.Issuer,
            Audience = _jwtOptions.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task IssueRefreshTokenCookieAsync(Guid userId, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return;

        var days = _authSecurity.RefreshTokenLifetimeDays <= 0 ? 30 : _authSecurity.RefreshTokenLifetimeDays;
        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(days);

        _dbContext.RefreshTokens.Add(new WixiRefreshToken
        {
            UserId = userId,
            Token = token,
            ExpiresAt = expiresAt,
            IsRevoked = false,
            IpAddress = context.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context.Request.Headers["User-Agent"].ToString()
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        _refreshCookie.AppendRefreshCookie(token, new DateTimeOffset(expiresAt, TimeSpan.Zero));
    }
}
