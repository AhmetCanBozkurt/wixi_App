namespace wixi.Email.Entities;

/// <summary>
/// Email log entity for tracking all email sending attempts
/// </summary>
public class EmailLog
{
    public long Id { get; set; }
    
    // Correlation for tracking related emails
    public Guid? CorrelationId { get; set; }
    
    // Email details
    public string FromEmail { get; set; } = string.Empty;
    public string? FromName { get; set; }
    public string ToEmails { get; set; } = string.Empty;  // Comma-separated
    public string? CcEmails { get; set; }  // Comma-separated
    public string? BccEmails { get; set; }  // Comma-separated
    public string? Subject { get; set; }
    public string? BodyHtml { get; set; }
    public string? BodyText { get; set; }
    public string? Attachments { get; set; }  // JSON array of attachment info
    
    // Sending status
    public EmailStatus Status { get; set; } = EmailStatus.Queued;
    public int AttemptCount { get; set; } = 0;
    public DateTime? LastAttemptAt { get; set; }
    public string? LastError { get; set; }
    
    // SMTP configuration used (for debugging)
    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public bool? UsedSsl { get; set; }
    public string? UsedUserName { get; set; }
    
    // Template reference (if sent via template)
    public string? TemplateKey { get; set; }
    
    // Additional metadata
    public string? MetadataJson { get; set; }
    public string? RequestIp { get; set; }
    public string? UserAgent { get; set; }
    public string? CreatedBy { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Email status enum
/// </summary>
public enum EmailStatus : byte
{
    Queued = 0,
    Sent = 1,
    Failed = 2,
    Retrying = 3,
    Cancelled = 4
}

