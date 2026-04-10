using Microsoft.AspNetCore.Identity;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiRole : IdentityRole<Guid>, IAuditable
{
    public string? Description { get; set; }
    
    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
