using Microsoft.AspNetCore.Identity;

namespace wixi.Identity.Entities;

/// <summary>
/// User entity with all authentication and security features
/// Extends IdentityUser<int> for ASP.NET Core Identity integration
/// </summary>
public class User : IdentityUser<int>
{
    // Personal Info (additional fields beyond IdentityUser)
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    // Two-Factor Authentication (custom fields)
    public string? TwoFactorCode { get; set; }
    public DateTime? TwoFactorCodeExpiration { get; set; }
    
    // Status
    public bool IsActive { get; set; } = true;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}";
    public bool IsLockedOut => LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
    public bool Can2FA => TwoFactorEnabled && !string.IsNullOrEmpty(TwoFactorCode) 
        && TwoFactorCodeExpiration.HasValue && TwoFactorCodeExpiration.Value > DateTime.UtcNow;
}

