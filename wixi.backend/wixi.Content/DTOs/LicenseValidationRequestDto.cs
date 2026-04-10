namespace wixi.Content.DTOs;

/// <summary>
/// DTO for license validation request
/// </summary>
public class LicenseValidationRequestDto
{
    public string LicenseKey { get; set; } = string.Empty;
    public string? MachineCode { get; set; }
    public string? ClientVersion { get; set; }
}

