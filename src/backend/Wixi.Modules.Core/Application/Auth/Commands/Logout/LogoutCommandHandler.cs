using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, AuthResult>
{
    private readonly WixiCoreDbContext _dbContext;
    private readonly IRefreshTokenCookieService _refreshCookie;

    public LogoutCommandHandler(
        WixiCoreDbContext dbContext,
        IRefreshTokenCookieService refreshCookie)
    {
        _dbContext = dbContext;
        _refreshCookie = refreshCookie;
    }

    public async Task<AuthResult> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var rt = _refreshCookie.GetRefreshTokenFromRequest();

        if (!string.IsNullOrWhiteSpace(rt))
        {
            var record = await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == rt, cancellationToken);
            if (record != null)
            {
                record.IsRevoked = true;
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            _refreshCookie.DeleteRefreshCookie();
        }

        return new AuthResult { Success = true };
    }
}
