namespace wixi.CVBuilder.DTOs;

/// <summary>
/// DTO for saving CV data
/// </summary>
public class SaveCVDataDto
{
    public Guid? SessionId { get; set; }
    public long? PaymentId { get; set; }
    public long? DocumentId { get; set; }
    
    // CV Data (JSON strings)
    public string PersonalInfo { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public string Education { get; set; } = string.Empty;
    public string Skills { get; set; } = string.Empty;
    public string Languages { get; set; } = string.Empty;
    public string Certificates { get; set; } = string.Empty;
}

