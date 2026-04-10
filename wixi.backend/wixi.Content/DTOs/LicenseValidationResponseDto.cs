namespace wixi.Content.DTOs;

/// <summary>
/// DTO for license validation API response
/// </summary>
public class LicenseValidationResponseDto
{
    public bool Success { get; set; }
    public LicenseDataDto? Data { get; set; }
}

/// <summary>
/// License data from API
/// </summary>
public class LicenseDataDto
{
    public bool IsValid { get; set; }
    public DateTime? ExpireDate { get; set; }
    public List<string>? Modules { get; set; }
    public int? MaxUser { get; set; }
    public int? TenantId { get; set; }
    public string? TenantCompanyName { get; set; }
    public string? Reason { get; set; }
}

