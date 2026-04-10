namespace wixi.Content.DTOs;

/// <summary>
/// DTO for license status information
/// </summary>
public class LicenseStatusDto
{
    public bool IsValid { get; set; }
    public DateTime? ExpireDate { get; set; }
    public bool IsExpired { get; set; }
    public int DaysRemaining { get; set; }
    public string? TenantCompanyName { get; set; }
    public DateTime? LastValidatedAt { get; set; }
}

