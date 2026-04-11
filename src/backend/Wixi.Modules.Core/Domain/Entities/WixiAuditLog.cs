using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiAuditLog : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Core Fields
    public string Action { get; set; } = string.Empty; // e.g. "CREATE", "UPDATE", "DELETE", "SOFT_DELETE"
    public string? TableName { get; set; }
    public string? EntityId { get; set; }
    public string? Details { get; set; } // General summary or JSON diff summary
    
    // Change Tracking (JSON)
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? AffectedColumns { get; set; }

    // User Context
    public string? UserId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; } // Name of the user at the time of action
    
    // Connection info
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    
    // IAuditable compliance
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
}
