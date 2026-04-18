namespace Wixi.Shared.Configuration;

public class AuthRateLimitOptions
{
    public const string SectionName = "AuthRateLimits";

    public int LoginPermitPerMinute { get; set; } = 30;

    public int VerifyTwoFactorPermitPerMinute { get; set; } = 40;

    public int ResendTwoFactorPermitPerMinute { get; set; } = 15;

    public int RefreshPermitPerMinute { get; set; } = 60;

    public int ForgotPasswordPermitPerMinute { get; set; } = 8;

    public int ResetPasswordPermitPerMinute { get; set; } = 15;

    public int RegisterPermitPerMinute { get; set; } = 20;

    public int LogoutAllPermitPerMinute { get; set; } = 30;
}
