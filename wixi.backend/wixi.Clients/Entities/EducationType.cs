namespace wixi.Clients.Entities;

/// <summary>
/// Represents types of education (University, Vocational School, Apprenticeship)
/// Multi-language support: TR, EN, DE, AR
/// </summary>
public class EducationType
{
    public int Id { get; set; }
    
    /// <summary>
    /// Unique code for programmatic access (e.g., "university", "vocational", "apprenticeship")
    /// </summary>
    public string Code { get; set; } = string.Empty;
    
    // Multi-language Names (4 languages: TR, EN, DE, AR)
    public string Name_TR { get; set; } = string.Empty;  // "Üniversite Mezunu"
    public string Name_EN { get; set; } = string.Empty;  // "University Graduate"
    public string Name_DE { get; set; } = string.Empty;  // "Hochschulabsolvent"
    public string Name_AR { get; set; } = string.Empty;  // "خريج جامعي"
    
    // Multi-language Descriptions (4 languages: TR, EN, DE, AR)
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    /// <summary>
    /// Display order in UI
    /// </summary>
    public int DisplayOrder { get; set; }
    
    /// <summary>
    /// Icon name for UI (e.g., "graduation-cap", "toolbox")
    /// </summary>
    public string? IconName { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
}

