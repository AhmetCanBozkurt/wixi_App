using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiAuditLog : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Core Fields
    public string Action { get; set; } = string.Empty; // e.g. "LOGIN_SUCCESS", "LOGIN_FAILED"
    public string? Details { get; set; }
    
    // User Context
    public string? UserId { get; set; }
    public string? Email { get; set; }
    
    // Connection info
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    
    // IAuditable compliance
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
}
