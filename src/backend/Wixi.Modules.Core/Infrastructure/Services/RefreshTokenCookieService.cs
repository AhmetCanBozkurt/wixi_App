using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class RefreshTokenCookieService : IRefreshTokenCookieService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AuthSecurityOptions _options;

    public RefreshTokenCookieService(
        IHttpContextAccessor httpContextAccessor,
        IOptions<AuthSecurityOptions> options)
    {
        _httpContextAccessor = httpContextAccessor;
        _options = options.Value;
    }

    public string CookieName => string.IsNullOrWhiteSpace(_options.RefreshCookieName)
        ? "wixi_rt"
        : _options.RefreshCookieName;

    public string? GetRefreshTokenFromRequest()
    {
        return _httpContextAccessor.HttpContext?.Request.Cookies[CookieName];
    }

    public void AppendRefreshCookie(string rawToken, DateTimeOffset expiresAt)
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx == null) return;

        ctx.Response.Cookies.Append(CookieName, rawToken, BuildCookieOptions(expiresAt));
    }

    public void DeleteRefreshCookie()
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx == null) return;

        ctx.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = _options.RefreshCookieHttpOnly,
            Secure = _options.RefreshCookieSecure,
            SameSite = ParseSameSite(_options.RefreshCookieSameSite),
            Path = string.IsNullOrWhiteSpace(_options.RefreshCookiePath) ? "/" : _options.RefreshCookiePath,
            Domain = string.IsNullOrWhiteSpace(_options.RefreshCookieDomain) ? null : _options.RefreshCookieDomain
        });
    }

    private CookieOptions BuildCookieOptions(DateTimeOffset expiresAt)
    {
        return new CookieOptions
        {
            HttpOnly = _options.RefreshCookieHttpOnly,
            Secure = _options.RefreshCookieSecure,
            SameSite = ParseSameSite(_options.RefreshCookieSameSite),
            Expires = expiresAt,
            Path = string.IsNullOrWhiteSpace(_options.RefreshCookiePath) ? "/" : _options.RefreshCookiePath,
            Domain = string.IsNullOrWhiteSpace(_options.RefreshCookieDomain) ? null : _options.RefreshCookieDomain
        };
    }

    private static SameSiteMode ParseSameSite(string? value)
    {
        if (string.Equals(value, "Strict", StringComparison.OrdinalIgnoreCase))
            return SameSiteMode.Strict;
        if (string.Equals(value, "Lax", StringComparison.OrdinalIgnoreCase))
            return SameSiteMode.Lax;
        return SameSiteMode.None;
    }
}
