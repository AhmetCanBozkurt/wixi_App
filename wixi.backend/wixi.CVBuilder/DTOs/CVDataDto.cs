namespace wixi.CVBuilder.DTOs;

/// <summary>
/// DTO for CV data
/// </summary>
public class CVDataDto
{
    public int Id { get; set; }
    public long PaymentId { get; set; }
    public int ClientId { get; set; }
    public long? DocumentId { get; set; }
    public Guid SessionId { get; set; }
    
    // CV Data (JSON strings)
    public string PersonalInfo { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public string Education { get; set; } = string.Empty;
    public string Skills { get; set; } = string.Empty;
    public string Languages { get; set; } = string.Empty;
    public string Certificates { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

