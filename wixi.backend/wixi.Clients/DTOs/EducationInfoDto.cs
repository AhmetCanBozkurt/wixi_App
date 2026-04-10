namespace wixi.Clients.DTOs;

/// <summary>
/// Education information data transfer object
/// </summary>
public class EducationInfoDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string Level { get; set; } = string.Empty; // EducationLevel enum
    public string Degree { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string? FieldOfStudy { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public bool IsCurrent { get; set; }
    public decimal? GPA { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating new education info
/// </summary>
public class CreateEducationInfoDto
{
    public int ClientId { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string Institution { get; set; } = string.Empty;
    public string? FieldOfStudy { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public bool IsCurrent { get; set; } = false;
    public decimal? GPA { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// DTO for updating education info
/// </summary>
public class UpdateEducationInfoDto
{
    public string? Level { get; set; }
    public string? Degree { get; set; }
    public string? Institution { get; set; }
    public string? FieldOfStudy { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public bool? IsCurrent { get; set; }
    public decimal? GPA { get; set; }
    public string? Description { get; set; }
}
