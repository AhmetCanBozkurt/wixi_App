namespace Wixi.Modules.Core.Domain.Entities;

/// <summary>
/// E-posta ile gönderilen 2FA OTP kodlarını tutan tablo.
/// </summary>
public class WixiTwoFactorCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    /// <summary>SHA-256 tabanlı OTP özeti (düz OTP saklanmaz).</summary>
    public string CodeHash { get; set; } = string.Empty;

    public string CodeSalt { get; set; } = string.Empty;

    /// <summary>Geçici token — login sonrası 2FA doğrulamasında kimlik olarak kullanılır.</summary>
    public string SessionToken { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public int AttemptCount { get; set; } = 0;
    public DateTime? LastResendAtUtc { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
