namespace wixi.Content.Entities;

/// <summary>
/// System Settings - General system configuration
/// </summary>
public class SystemSettings
{
    public int Id { get; set; }
    
    /// <summary>
    /// Site name
    /// </summary>
    public string SiteName { get; set; } = string.Empty;
    
    /// <summary>
    /// Site URL
    /// </summary>
    public string SiteUrl { get; set; } = string.Empty;
    
    /// <summary>
    /// Admin email for notifications
    /// </summary>
    public string AdminEmail { get; set; } = string.Empty;
    
    /// <summary>
    /// Portal URL for email templates
    /// </summary>
    public string PortalUrl { get; set; } = "https://portal.worklines.de";
    
    /// <summary>
    /// Support email for email templates
    /// </summary>
    public string SupportEmail { get; set; } = "support@worklines.de";
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    
    /// <summary>
    /// Row version for concurrency control
    /// </summary>
    public byte[]? RowVersion { get; set; }
}

