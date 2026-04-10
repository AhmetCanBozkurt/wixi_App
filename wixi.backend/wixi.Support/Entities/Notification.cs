namespace wixi.Support.Entities;

/// <summary>
/// Represents a notification sent to a user
/// </summary>
public class Notification
{
    public long Id { get; set; }
    
    // User relationship (from Identity module)
    public int UserId { get; set; }
    
    // Notification content
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }  // URL to navigate when clicked
    public string? ActionText { get; set; }  // Button/link text
    
    // Related entities (polymorphic reference)
    public string? RelatedEntityType { get; set; }  // "Document", "Application", "Ticket"
    public long? RelatedEntityId { get; set; }
    
    // Status
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    public bool IsArchived { get; set; } = false;
    public DateTime? ArchivedAt { get; set; }
    
    // Priority
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    
    // Delivery
    public bool SentViaEmail { get; set; } = false;
    public DateTime? EmailSentAt { get; set; }
    public bool SentViaPush { get; set; } = false;
    public DateTime? PushSentAt { get; set; }
    
    // Expiration
    public DateTime? ExpiresAt { get; set; }
    
    // Additional metadata as JSON
    public string? MetadataJson { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Computed properties
    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    public bool IsUnread => !IsRead && !IsArchived && !IsExpired;
}

/// <summary>
/// Notification type enum
/// </summary>
public enum NotificationType
{
    DocumentApproved = 1,
    DocumentRejected = 2,
    DocumentMissingInfo = 3,
    StepCompleted = 4,
    ApplicationStatusChanged = 5,
    NewMessage = 6,
    TicketAssigned = 7,
    TicketResolved = 8,
    System = 9,
    Warning = 10,
    Info = 11
}

/// <summary>
/// Notification priority enum
/// </summary>
public enum NotificationPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4
}

