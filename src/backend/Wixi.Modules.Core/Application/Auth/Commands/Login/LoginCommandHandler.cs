using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Auth.Services;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly JwtOptions _jwtOptions;
    private readonly AuthSecurityOptions _authSecurity;
    private readonly WixiCoreDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IMailService _mailService;
    private readonly IOtpPepperProvider _otpPepper;
    private readonly IRefreshTokenCookieService _refreshCookie;

    public LoginCommandHandler(
        UserManager<WixiUser> userManager,
        IOptions<JwtOptions> jwtOptions,
        IOptions<AuthSecurityOptions> authSecurity,
        WixiCoreDbContext dbContext,
        IHttpContextAccessor httpContextAccessor,
        IMailService mailService,
        IOtpPepperProvider otpPepper,
        IRefreshTokenCookieService refreshCookie)
    {
        _userManager = userManager;
        _jwtOptions = jwtOptions.Value;
        _authSecurity = authSecurity.Value;
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
        _mailService = mailService;
        _otpPepper = otpPepper;
        _refreshCookie = refreshCookie;
    }

    public async Task<AuthResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            await LogAuditAsync(user, request.Email, "LOGIN_FAILED", "Kullanıcı adı veya şifre hatalı.", cancellationToken);
            return new AuthResult { Success = false, ErrorMessage = "E-posta veya şifre hatalı." };
        }

        if (user.TwoFactorEnabled)
        {
            var (code, sessionToken, expiresAt) = GenerateOtp();

            var oldCodes = _dbContext.Set<WixiTwoFactorCode>()
                .Where(x => x.UserId == user.Id && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow);
            _dbContext.RemoveRange(oldCodes);

            var salt = OtpHasher.CreateSalt();
            var hash = OtpHasher.Hash(_otpPepper.Pepper, sessionToken, code, salt);

            _dbContext.Set<WixiTwoFactorCode>().Add(new WixiTwoFactorCode
            {
                UserId = user.Id,
                CodeHash = hash,
                CodeSalt = salt,
                SessionToken = sessionToken,
                ExpiresAt = expiresAt,
                IsUsed = false,
                AttemptCount = 0,
                LastResendAtUtc = null
            });
            await _dbContext.SaveChangesAsync(cancellationToken);

            await _mailService.SendWithTemplateAsync(
                "TWO_FACTOR_AUTH",
                user.Email!,
                new { fullName = $"{user.FirstName} {user.LastName}", code },
                cancellationToken);

            await LogAuditAsync(user, user.Email, "LOGIN_2FA_REQUIRED", "2FA doğrulama gerekiyor, OTP mail ile gönderildi.", cancellationToken);

            return new AuthResult
            {
                Success = true,
                RequiresTwoFactor = true,
                TwoFactorToken = sessionToken
            };
        }

        var accessToken = await GenerateJwtToken(user);

        if (request.RememberMe)
        {
            await IssueRefreshTokenCookieAsync(user.Id, cancellationToken);
        }

        await LogAuditAsync(user, user.Email, "LOGIN_SUCCESS", "Kullanıcı başarıyla giriş yaptı.", cancellationToken);

        return new AuthResult
        {
            Success = true,
            Token = accessToken
        };
    }

    private async Task<string> GenerateJwtToken(WixiUser user)
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

    private static (string code, string sessionToken, DateTime expiresAt) GenerateOtp()
    {
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var sessionToken = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddMinutes(5);
        return (code, sessionToken, expiresAt);
    }

    private async Task IssueRefreshTokenCookieAsync(Guid userId, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        if (context == null) return;

        var days = _authSecurity.RefreshTokenLifetimeDays <= 0 ? 30 : _authSecurity.RefreshTokenLifetimeDays;
        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(days);

        _dbContext.Set<WixiRefreshToken>().Add(new WixiRefreshToken
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

    private async Task LogAuditAsync(WixiUser? user, string? email, string action, string details, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        var ipAddress = context?.Connection?.RemoteIpAddress?.ToString();
        var userAgent = context?.Request?.Headers["User-Agent"].ToString();

        await _dbContext.LogSecurityEventAsync(
            action,
            details,
            user?.Id.ToString(),
            user?.Email ?? email,
            user != null ? $"{user.FirstName} {user.LastName}" : null,
            ipAddress,
            userAgent,
            cancellationToken);
    }
}
