namespace wixi.Clients.Entities;

/// <summary>
/// Represents a pending verification code for client registration
/// Stores pending client codes before profile creation
/// </summary>
public class PendingClientCode
{
    public int Id { get; set; }
    
    /// <summary>
    /// Client code (e.g., "WP-84321")
    /// </summary>
    public string ClientCode { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    
    /// <summary>
    /// Verification code sent to email
    /// </summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>
    /// Temporary client data (JSON serialized)
    /// </summary>
    public string? ClientData { get; set; }
    
    // Validity
    public DateTime ExpirationDate { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime? UsedAt { get; set; }
    
    /// <summary>
    /// Number of verification attempts
    /// </summary>
    public int AttemptCount { get; set; } = 0;
    
    /// <summary>
    /// Source employee submission ID
    /// </summary>
    public long? EmployeeSubmissionId { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Computed properties
    public bool IsExpired => DateTime.UtcNow > ExpirationDate;
    public bool IsValid => !IsUsed && !IsExpired;
}

