using Microsoft.AspNetCore.Identity;

namespace wixi.Identity.Entities;

/// <summary>
/// UserRole entity extending IdentityUserRole<int> for ASP.NET Core Identity integration
/// Note: IdentityUserRole uses composite key (UserId + RoleId), but we added Id as primary key
/// </summary>
public class UserRole : IdentityUserRole<int>
{
    public int Id { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}
