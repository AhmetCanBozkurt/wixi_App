using System.Security.Claims;
using wixi.Identity.Entities;

namespace wixi.Identity.Interfaces;

public interface IJwtService
{
    /// <summary>
    /// Generate JWT access token
    /// </summary>
    string GenerateAccessToken(User user, List<string> roles);

    /// <summary>
    /// Generate refresh token
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Validate JWT token and return claims
    /// </summary>
    ClaimsPrincipal? ValidateToken(string token);

    /// <summary>
    /// Get user ID from token claims
    /// </summary>
    int? GetUserIdFromToken(string token);
}

