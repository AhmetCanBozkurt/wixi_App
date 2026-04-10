namespace wixi.Content.Entities;

/// <summary>
/// License Settings - License key and validation information
/// </summary>
public class LicenseSettings
{
    public int Id { get; set; }
    
    /// <summary>
    /// License key from external API
    /// </summary>
    public string LicenseKey { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether the license is currently valid
    /// </summary>
    public bool IsValid { get; set; }
    
    /// <summary>
    /// License expiration date
    /// </summary>
    public DateTime? ExpireDate { get; set; }
    
    /// <summary>
    /// Tenant ID from license API
    /// </summary>
    public int? TenantId { get; set; }
    
    /// <summary>
    /// Tenant company name from license API
    /// </summary>
    public string? TenantCompanyName { get; set; }
    
    /// <summary>
    /// Machine code used for validation
    /// </summary>
    public string? MachineCode { get; set; }
    
    /// <summary>
    /// Client version used for validation
    /// </summary>
    public string? ClientVersion { get; set; }
    
    /// <summary>
    /// Last validation timestamp
    /// </summary>
    public DateTime? LastValidatedAt { get; set; }
    
    /// <summary>
    /// Full validation result from API (JSON)
    /// </summary>
    public string? ValidationResult { get; set; }
    
    /// <summary>
    /// Whether this license record is active
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    
    /// <summary>
    /// Row version for concurrency control
    /// </summary>
    public byte[]? RowVersion { get; set; }
}

