using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.Logout;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, AuthResult>
{
    private readonly WixiCoreDbContext _dbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LogoutCommandHandler(WixiCoreDbContext dbContext, IHttpContextAccessor httpContextAccessor)
    {
        _dbContext = dbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<AuthResult> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        var rt = context?.Request.Cookies["wixi_rt"];

        if (!string.IsNullOrWhiteSpace(rt))
        {
            var record = await _dbContext.RefreshTokens.FirstOrDefaultAsync(x => x.Token == rt, cancellationToken);
            if (record != null)
            {
                record.IsRevoked = true;
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            if (context != null)
            {
                context.Response.Cookies.Delete("wixi_rt", new CookieOptions
                {
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    HttpOnly = true
                });
            }
        }

        return new AuthResult { Success = true };
    }
}

