namespace Wixi.Modules.Core.Application.Auth.Dto;

public class AuthResult
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public bool RequiresTwoFactor { get; set; }
    public string? TwoFactorToken { get; set; }
}
