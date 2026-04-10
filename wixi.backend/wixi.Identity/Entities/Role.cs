using Microsoft.AspNetCore.Identity;

namespace wixi.Identity.Entities;

/// <summary>
/// Role entity extending IdentityRole<int> for ASP.NET Core Identity integration
/// </summary>
public class Role : IdentityRole<int>
{
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

