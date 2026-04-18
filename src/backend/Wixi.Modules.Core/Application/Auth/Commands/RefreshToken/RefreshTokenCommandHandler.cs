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

namespace Wixi.Modules.Core.Application.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResult>
{
    private readonly WixiCoreDbContext _dbContext;
    private readonly UserManager<WixiUser> _userManager;
    private readonly JwtOptions _jwtOptions;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public RefreshTokenCommandHandler(
        WixiCoreDbContext dbContext,
        UserManager<WixiUser> userManager,
        IOptions<JwtOptions> jwtOptions,
        IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _userManager = userManager;
        _jwtOptions = jwtOptions.Value;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        var rt = context?.Request.Cookies["wixi_rt"];

        if (string.IsNullOrWhiteSpace(rt))
            return new AuthResult { Success = false, ErrorMessage = "Refresh token bulunamadı." };

        var record = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == rt, cancellationToken);

        if (record == null || record.IsRevoked || record.ExpiresAt <= DateTime.UtcNow)
            return new AuthResult { Success = false, ErrorMessage = "Refresh token geçersiz veya süresi dolmuş." };

        var user = await _userManager.FindByIdAsync(record.UserId.ToString());
        if (user == null)
            return new AuthResult { Success = false, ErrorMessage = "Kullanıcı bulunamadı." };

        // Rotate refresh token for better security
        record.IsRevoked = true;

        var newToken = Guid.NewGuid().ToString("N");
        var expiresAt = DateTime.UtcNow.AddDays(30);

        _dbContext.RefreshTokens.Add(new WixiRefreshToken
        {
            UserId = user.Id,
            Token = newToken,
            ExpiresAt = expiresAt,
            IsRevoked = false,
            IpAddress = context?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = context?.Request.Headers["User-Agent"].ToString()
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (context != null)
        {
            context.Response.Cookies.Append("wixi_rt", newToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = expiresAt
            });
        }

        var jwt = await GenerateJwtAsync(user);

        return new AuthResult
        {
            Success = true,
            Token = jwt
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
}

