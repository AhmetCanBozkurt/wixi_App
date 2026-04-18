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
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Auth.Commands.VerifyTwoFactor;

public class VerifyTwoFactorCommandHandler : IRequestHandler<VerifyTwoFactorCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly JwtOptions _jwtOptions;
    private readonly WixiCoreDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public VerifyTwoFactorCommandHandler(
        UserManager<WixiUser> userManager,
        IOptions<JwtOptions> jwtOptions,
        WixiCoreDbContext dbContext,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _jwtOptions = jwtOptions.Value;
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResult> Handle(VerifyTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var record = await _dbContext.TwoFactorCodes
            .FirstOrDefaultAsync(x => x.SessionToken == request.TwoFactorToken, cancellationToken);

        if (record == null || record.IsUsed || record.ExpiresAt <= DateTime.UtcNow)
        {
            return new AuthResult { Success = false, ErrorMessage = "2FA oturumu geçersiz veya süresi dolmuş." };
        }

        if (record.AttemptCount >= 3)
        {
            return new AuthResult { Success = false, ErrorMessage = "Çok fazla deneme yapıldı. Lütfen tekrar giriş yapın." };
        }

        if (!string.Equals(record.Code, request.OtpCode, StringComparison.Ordinal))
        {
            record.AttemptCount += 1;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return new AuthResult { Success = false, ErrorMessage = "Doğrulama kodu hatalı." };
        }

        record.IsUsed = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        var user = await _userManager.FindByIdAsync(record.UserId.ToString());
        if (user == null)
        {
            return new AuthResult { Success = false, ErrorMessage = "Kullanıcı bulunamadı." };
        }

        var accessToken = await GenerateJwtAsync(user);

        if (request.RememberMe)
        {
            await IssueRefreshTokenCookieAsync(user.Id, cancellationToken);
        }

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

        var token = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(30);

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

        context.Response.Cookies.Append("wixi_rt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = expiresAt
        });
    }
}

