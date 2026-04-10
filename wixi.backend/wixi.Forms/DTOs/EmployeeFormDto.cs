namespace wixi.Forms.DTOs;

/// <summary>
/// DTO for submitting employee form
/// </summary>
public class SubmitEmployeeFormDto
{
    public string? Salutation { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Profession { get; set; }
    public int? Experience { get; set; }
    public string? Education { get; set; }
    public string? GermanLevel { get; set; }
    public string? AdditionalInfo { get; set; }
    public string? CvFileName { get; set; }
    public string? CvFilePath { get; set; }
    public long? CvFileSize { get; set; }
    public string? SpecialRequests { get; set; }
    public string? Language { get; set; }
}

/// <summary>
/// DTO for employee form response
/// </summary>
public class EmployeeFormDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Salutation { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Profession { get; set; }
    public int? Experience { get; set; }
    public string? Education { get; set; }
    public string? GermanLevel { get; set; }
    public string? AdditionalInfo { get; set; }
    public string? CvFileName { get; set; }
    public string? CvFilePath { get; set; }
    public long? CvFileSize { get; set; }
    public string? SpecialRequests { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

