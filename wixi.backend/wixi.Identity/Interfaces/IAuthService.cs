using wixi.Identity.DTOs;

namespace wixi.Identity.Interfaces;

public interface IAuthService
{
    /// <summary>
    /// Register a new user
    /// </summary>
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, string ipAddress, string userAgent);

    /// <summary>
    /// Login user
    /// </summary>
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto, string ipAddress, string userAgent);

    /// <summary>
    /// Refresh access token
    /// </summary>
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent);

    /// <summary>
    /// Revoke refresh token
    /// </summary>
    Task RevokeTokenAsync(string refreshToken);

    /// <summary>
    /// Get user by ID
    /// </summary>
    Task<UserDto?> GetUserByIdAsync(int userId);

    /// <summary>
    /// Logout user by blacklisting access token
    /// </summary>
    Task<bool> LogoutAsync(string accessToken, int userId, string reason = "User logout");

    /// <summary>
    /// Logout all sessions for a user (revoke all refresh tokens)
    /// </summary>
    Task<int> LogoutAllUserSessionsAsync(int userId, string reason = "Logout all sessions");

    /// <summary>
    /// Send password reset email
    /// </summary>
    Task ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto, string resetUrlBase);

    /// <summary>
    /// Reset password using token
    /// </summary>
    Task ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
}

