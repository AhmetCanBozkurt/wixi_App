namespace wixi.Email.Entities;

/// <summary>
/// Email template entity for storing reusable email templates
/// Multi-language support: TR, EN, DE, AR
/// Template keys: WelcomeEmail, DocumentApproved, DocumentRejected, ApplicationStatusChanged, etc.
/// </summary>
public class EmailTemplate
{
    public int Id { get; set; }
    
    /// <summary>
    /// Unique key for programmatic access (e.g., "WelcomeEmail", "DocumentApproved")
    /// </summary>
    public string Key { get; set; } = string.Empty;
    
    // Multi-language Display Names (4 languages: TR, EN, DE, AR)
    // Used for UI display in template lists
    public string DisplayName_TR { get; set; } = string.Empty;
    public string DisplayName_EN { get; set; } = string.Empty;
    public string DisplayName_DE { get; set; } = string.Empty;
    public string DisplayName_AR { get; set; } = string.Empty;
    
    // Multi-language Subjects (4 languages: TR, EN, DE, AR)
    public string Subject_TR { get; set; } = string.Empty;
    public string Subject_EN { get; set; } = string.Empty;
    public string Subject_DE { get; set; } = string.Empty;
    public string Subject_AR { get; set; } = string.Empty;
    
    // Multi-language HTML Bodies (4 languages: TR, EN, DE, AR)
    // Supports placeholders like {{FirstName}}, {{DocumentType}}, etc.
    public string BodyHtml_TR { get; set; } = string.Empty;
    public string BodyHtml_EN { get; set; } = string.Empty;
    public string BodyHtml_DE { get; set; } = string.Empty;
    public string BodyHtml_AR { get; set; } = string.Empty;
    
    // Template metadata
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    
    // Optimistic concurrency
    public byte[]? RowVersion { get; set; }
}

