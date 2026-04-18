namespace Wixi.Modules.Core.Domain.Entities;

/// <summary>
/// "Beni Hatırla" özelliği için HTTP-Only cookie'de saklanan refresh token'ları tutar.
/// </summary>
public class WixiRefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    /// <summary>Cookie'de saklanan opaque token değeri.</summary>
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
