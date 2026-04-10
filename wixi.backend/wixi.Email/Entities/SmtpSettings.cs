namespace wixi.Email.Entities;

/// <summary>
/// SMTP settings entity for email configuration
/// Stores encrypted SMTP credentials and connection details
/// </summary>
public class SmtpSettings
{
    public int Id { get; set; }
    
    // SMTP server connection
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public bool UseSsl { get; set; } = true;
    
    // Authentication
    public string UserName { get; set; } = string.Empty;
    public string PasswordEnc { get; set; } = string.Empty;  // Encrypted at rest
    
    // Sender info
    public string FromName { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    
    // Connection settings
    public int? TimeoutMs { get; set; }
    public int RetryCount { get; set; } = 3;
    public int MaxAttemptsPerEmail { get; set; } = 5;
    
    // Active configuration
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    
    // Optimistic concurrency
    public byte[]? RowVersion { get; set; }
}

