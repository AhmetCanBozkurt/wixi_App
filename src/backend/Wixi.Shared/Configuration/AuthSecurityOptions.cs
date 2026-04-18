namespace Wixi.Shared.Configuration;

/// <summary>Auth hardening: OTP pepper, refresh cookie, 2FA resend cooldown.</summary>
public class AuthSecurityOptions
{
    public const string SectionName = "AuthSecurity";

    /// <summary>Secret mixed into OTP hashing (use a long random value in production).</summary>
    public string OtpPepper { get; set; } = string.Empty;

    /// <summary>If true and OtpPepper is empty, JwtSettings:SecretKey is used as pepper (dev convenience only).</summary>
    public bool FallbackOtpPepperToJwtSecret { get; set; } = true;

    public int TwoFactorResendCooldownSeconds { get; set; } = 60;

    public string RefreshCookieName { get; set; } = "wixi_rt";

    public bool RefreshCookieHttpOnly { get; set; } = true;

    public bool RefreshCookieSecure { get; set; } = true;

    /// <summary>Strict, Lax, or None (cross-site SPA + API).</summary>
    public string RefreshCookieSameSite { get; set; } = "None";

    public string RefreshCookiePath { get; set; } = "/";

    public string? RefreshCookieDomain { get; set; }

    public int RefreshTokenLifetimeDays { get; set; } = 30;
}
