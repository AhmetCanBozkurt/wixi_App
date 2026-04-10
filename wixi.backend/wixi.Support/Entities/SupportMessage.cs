namespace wixi.Support.Entities;

/// <summary>
/// Represents a message within a support ticket
/// </summary>
public class SupportMessage
{
    public long Id { get; set; }
    
    // Ticket relationship
    public long TicketId { get; set; }
    public virtual SupportTicket Ticket { get; set; } = null!;
    
    // Sender relationship (User from Identity module)
    public int SenderId { get; set; }
    
    // Message content
    public string Message { get; set; } = string.Empty;
    public bool IsInternal { get; set; } = false;  // Internal notes (admin only)
    public bool IsFromClient { get; set; } = true;
    public bool IsAutomated { get; set; } = false;  // Automated response
    
    // Attachments
    public string? AttachmentFileName { get; set; }
    public string? AttachmentPath { get; set; }
    public long? AttachmentSizeBytes { get; set; }
    
    // Status tracking
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    
    // Additional metadata
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }  // Soft delete
    
    // Computed properties
    public bool IsDeleted => DeletedAt.HasValue;
    public bool HasAttachment => !string.IsNullOrEmpty(AttachmentPath);
}

