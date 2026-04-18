namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IRefreshTokenCookieService
{
    string CookieName { get; }

    string? GetRefreshTokenFromRequest();

    void AppendRefreshCookie(string rawToken, DateTimeOffset expiresAt);

    void DeleteRefreshCookie();
}
