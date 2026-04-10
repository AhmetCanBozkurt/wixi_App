namespace wixi.Applications.Entities;

/// <summary>
/// Represents a template for application processes
/// Multi-language support: TR, EN, DE, AR
/// </summary>
public class ApplicationTemplate
{
    public int Id { get; set; }
    
    // Multi-language Names (4 languages: TR, EN, DE, AR)
    public string Name_TR { get; set; } = string.Empty;  // "Denklik İşlem Süreci"
    public string Name_EN { get; set; } = string.Empty;  // "Recognition Process"
    public string Name_DE { get; set; } = string.Empty;  // "Anerkennungsverfahren"
    public string Name_AR { get; set; } = string.Empty;  // "عملية الاعتراف"
    
    // Multi-language Descriptions (4 languages: TR, EN, DE, AR)
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    // Template type
    public ApplicationType Type { get; set; }
    
    // Configuration
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public int DisplayOrder { get; set; }
    public string? IconName { get; set; }
    
    // Duration estimates (in days)
    public int? EstimatedDurationDays { get; set; }
    public int? MinDurationDays { get; set; }
    public int? MaxDurationDays { get; set; }
    
    // Relations
    public virtual ICollection<ApplicationStepTemplate> StepTemplates { get; set; } = new List<ApplicationStepTemplate>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

