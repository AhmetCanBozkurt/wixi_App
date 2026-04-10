using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using wixi.Identity.DTOs;
using wixi.Identity.Interfaces;
using wixi.WebAPI.Services;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Asp.Versioning.ApiVersion("1.0")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IAuditLogService _auditLogService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService, 
        IAuditLogService auditLogService, 
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _auditLogService = auditLogService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var response = await _authService.RegisterAsync(registerDto, ipAddress, userAgent);
        
        // Audit log
        await _auditLogService.LogAsync(
            response.User.Id, 
            "USER_REGISTERED", 
            "User", 
            response.User.Id.ToString(), 
            null, 
            new { response.User.Email, response.User.FirstName, response.User.LastName }, 
            ipAddress, 
            userAgent);
        
        _logger.LogInformation("User registered: {Email}", registerDto.Email);
        
        return Ok(response);
    }

    /// <summary>
    /// Login user
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

            var response = await _authService.LoginAsync(loginDto, ipAddress, userAgent);
            
            // Audit log (wrap in try-catch to prevent audit log failure from breaking login)
            try
            {
                await _auditLogService.LogAsync(
                    response.User.Id, 
                    "USER_LOGIN", 
                    "User", 
                    response.User.Id.ToString(), 
                    null, 
                    null, 
                    ipAddress, 
                    userAgent);
            }
            catch (Exception auditEx)
            {
                _logger.LogWarning(auditEx, "Failed to log audit event for user login: {UserId}", response.User.Id);
                // Don't fail the login if audit log fails
            }
            
            _logger.LogInformation("User logged in: {UserNameOrEmail}", loginDto.UserNameOrEmail);
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for user: {UserNameOrEmail}", loginDto?.UserNameOrEmail ?? "unknown");
            throw; // Let exception handling middleware handle it
        }
    }

    /// <summary>
    /// Refresh access token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        var response = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken, ipAddress, userAgent);
        
        return Ok(response);
    }

    /// <summary>
    /// Revoke refresh token (logout)
    /// </summary>
    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenDto refreshTokenDto)
    {
        await _authService.RevokeTokenAsync(refreshTokenDto.RefreshToken);
        
        _logger.LogInformation("Token revoked");
        
        return Ok(new { message = "Token revoked successfully" });
    }

    /// <summary>
    /// Get current user info
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Logout user by blacklisting access token
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        // Get access token from Authorization header
        var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Access token not found in request" });

        var accessToken = authHeader.Substring("Bearer ".Length).Trim();

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        await _authService.LogoutAsync(accessToken, userId);
        
        // Audit log
        await _auditLogService.LogAsync(
            userId, 
            "USER_LOGOUT", 
            "User", 
            userId.ToString(), 
            null, 
            null, 
            ipAddress, 
            userAgent);
        
        _logger.LogInformation("User logged out: {UserId}", userId);
        
        return Ok(new { message = "Logged out successfully" });
    }

    /// <summary>
    /// Logout all sessions for current user (revoke all refresh tokens and blacklist access token)
    /// </summary>
    [HttpPost("logout-all")]
    [Authorize]
    public async Task<IActionResult> LogoutAllSessions()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        // Get access token from Authorization header
        var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var accessToken = authHeader.Substring("Bearer ".Length).Trim();
            await _authService.LogoutAsync(accessToken, userId, "Logout all sessions");
        }

        // Revoke all refresh tokens
        var revokedCount = await _authService.LogoutAllUserSessionsAsync(userId, "User requested logout from all devices");

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        // Audit log
        await _auditLogService.LogAsync(
            userId, 
            "USER_LOGOUT_ALL_SESSIONS", 
            "User", 
            userId.ToString(), 
            null, 
            new { revokedTokensCount = revokedCount }, 
            ipAddress, 
            userAgent);
        
        _logger.LogInformation("User logged out from all sessions: {UserId}, Revoked {Count} tokens", userId, revokedCount);
        
        return Ok(new { message = "Logged out from all devices successfully", revokedSessions = revokedCount });
    }

    /// <summary>
    /// Request password reset (sends email with reset link)
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        try
        {
            // Get frontend URL from configuration or request
            var frontendUrl = Request.Headers["Origin"].FirstOrDefault() 
                ?? _configuration["FrontendUrl"] 
                ?? "http://localhost:5500";
            
            var resetUrlBase = $"{frontendUrl}/forgot-password";
            
            await _authService.ForgotPasswordAsync(forgotPasswordDto, resetUrlBase);
            
            _logger.LogInformation("Password reset requested for: {Email}", forgotPasswordDto.Email);
            
            // Always return success to prevent email enumeration
            return Ok(new { message = "If the email exists, a password reset link has been sent." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during forgot password for: {Email}", forgotPasswordDto?.Email ?? "unknown");
            throw; // Let exception handling middleware handle it
        }
    }

    /// <summary>
    /// Reset password using token from email
    /// </summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        try
        {
            await _authService.ResetPasswordAsync(resetPasswordDto);
            
            _logger.LogInformation("Password reset successful for: {Email}", resetPasswordDto.Email);
            
            return Ok(new { message = "Password has been reset successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during password reset for: {Email}", resetPasswordDto?.Email ?? "unknown");
            throw; // Let exception handling middleware handle it
        }
    }
}

