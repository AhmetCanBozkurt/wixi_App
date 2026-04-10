namespace wixi.Identity.Entities;

/// <summary>
/// Token Blacklist - Stores revoked JWT access tokens
/// Prevents logged-out users from using their old access tokens
/// </summary>
public class TokenBlacklist
{
    public int Id { get; set; }
    
    /// <summary>
    /// The JWT access token that has been revoked
    /// </summary>
    public string Token { get; set; } = string.Empty;
    
    /// <summary>
    /// User who owned this token
    /// </summary>
    public int UserId { get; set; }
    
    /// <summary>
    /// When the token was blacklisted
    /// </summary>
    public DateTime BlacklistedAt { get; set; }
    
    /// <summary>
    /// When the token expires (from JWT exp claim)
    /// Tokens can be automatically cleaned up after this date
    /// </summary>
    public DateTime ExpirationDate { get; set; }
    
    /// <summary>
    /// Reason for blacklisting (e.g., "User logout", "Password reset", "Security breach")
    /// </summary>
    public string? Reason { get; set; }
    
    // Navigation property
    public User User { get; set; } = null!;
}

