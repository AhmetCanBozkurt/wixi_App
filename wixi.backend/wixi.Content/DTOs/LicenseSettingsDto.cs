namespace wixi.Content.DTOs;

/// <summary>
/// DTO for license settings
/// </summary>
public class LicenseSettingsDto
{
    public int Id { get; set; }
    public string LicenseKey { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public DateTime? ExpireDate { get; set; }
    public int? TenantId { get; set; }
    public string? TenantCompanyName { get; set; }
    public string? MachineCode { get; set; }
    public string? ClientVersion { get; set; }
    public DateTime? LastValidatedAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

