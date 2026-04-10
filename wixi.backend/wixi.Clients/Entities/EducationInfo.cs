namespace wixi.Clients.Entities;

/// <summary>
/// Represents detailed education information for a client
/// </summary>
public class EducationInfo
{
    public int Id { get; set; }
    
    public int ClientId { get; set; }
    
    /// <summary>
    /// Education level (HighSchool, Bachelor, Master, PhD, Apprenticeship, etc.)
    /// </summary>
    public EducationLevel Level { get; set; }
    
    /// <summary>
    /// Degree or qualification (e.g., "Master of Science in Data Science")
    /// </summary>
    public string Degree { get; set; } = string.Empty;
    
    /// <summary>
    /// Name of institution (University name, School name, etc.)
    /// </summary>
    public string Institution { get; set; } = string.Empty;
    
    /// <summary>
    /// Field of study or major
    /// </summary>
    public string? FieldOfStudy { get; set; }
    
    public DateTime? StartDate { get; set; }
    public DateTime? GraduationDate { get; set; }
    
    /// <summary>
    /// Country where education was obtained
    /// </summary>
    public string? Country { get; set; }
    
    /// <summary>
    /// City where institution is located
    /// </summary>
    public string? City { get; set; }
    
    /// <summary>
    /// Is this the current/ongoing education?
    /// </summary>
    public bool IsCurrent { get; set; } = false;
    
    /// <summary>
    /// Grade Point Average
    /// </summary>
    public decimal? GPA { get; set; }
    
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual Client Client { get; set; } = null!;
}

/// <summary>
/// Education levels for classification
/// </summary>
public enum EducationLevel
{
    HighSchool = 1,
    VocationalSchool = 2,
    Associate = 3,
    Bachelor = 4,
    Master = 5,
    PhD = 6,
    Apprenticeship = 7,  // Kalfalık
    Mastership = 8       // Ustalık
}

