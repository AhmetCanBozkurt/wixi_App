namespace wixi.Applications.Entities;

/// <summary>
/// Represents a history/audit log entry for an application
/// </summary>
public class ApplicationHistory
{
    public long Id { get; set; }
    
    // Application relationship
    public long ApplicationId { get; set; }
    public virtual Application Application { get; set; } = null!;
    
    // Action info
    public string Action { get; set; } = string.Empty;  // "StatusChanged", "StepCompleted", "DocumentApproved"
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? Description { get; set; }
    
    // User info (from Identity module)
    public int? UserId { get; set; }  // Who made the change (admin/system)
    public string? UserType { get; set; }  // "Admin", "System", "Client"
    
    // Additional metadata
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? MetadataJson { get; set; }  // Additional metadata as JSON
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

