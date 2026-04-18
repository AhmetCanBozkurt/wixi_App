using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.LogoutAll;

public class LogoutAllCommandHandler : IRequestHandler<LogoutAllCommand, AuthResult>
{
    private readonly WixiCoreDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IRefreshTokenCookieService _refreshCookie;

    public LogoutAllCommandHandler(
        WixiCoreDbContext dbContext,
        IHttpContextAccessor httpContextAccessor,
        IRefreshTokenCookieService refreshCookie)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
        _refreshCookie = refreshCookie;
    }

    public async Task<AuthResult> Handle(LogoutAllCommand request, CancellationToken cancellationToken)
    {
        var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return new AuthResult { Success = false, ErrorMessage = "Oturum bulunamadı." };

        var tokens = await _dbContext.RefreshTokens
            .Where(x => x.UserId == userId && !x.IsRevoked)
            .ToListAsync(cancellationToken);

        foreach (var t in tokens)
            t.IsRevoked = true;

        await _dbContext.SaveChangesAsync(cancellationToken);
        _refreshCookie.DeleteRefreshCookie();

        return new AuthResult { Success = true };
    }
}
