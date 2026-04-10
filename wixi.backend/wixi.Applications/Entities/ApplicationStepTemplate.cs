namespace wixi.Applications.Entities;

/// <summary>
/// Represents a template for application steps
/// Multi-language support: TR, EN, DE, AR
/// </summary>
public class ApplicationStepTemplate
{
    public int Id { get; set; }
    
    // Application template relationship
    public int ApplicationTemplateId { get; set; }
    public virtual ApplicationTemplate Template { get; set; } = null!;
    
    // Multi-language Titles (4 languages: TR, EN, DE, AR)
    public string Title_TR { get; set; } = string.Empty;  // "Denklik İşlemleri"
    public string Title_EN { get; set; } = string.Empty;  // "Recognition Procedures"
    public string Title_DE { get; set; } = string.Empty;  // "Anerkennungsverfahren"
    public string Title_AR { get; set; } = string.Empty;  // "إجراءات الاعتراف"
    
    // Multi-language Descriptions (4 languages: TR, EN, DE, AR)
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    // Configuration
    public int StepOrder { get; set; }
    public string? IconName { get; set; }
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
    
    // Duration estimate (in days)
    public int? EstimatedDurationDays { get; set; }
    
    // Relations
    public virtual ICollection<ApplicationSubStepTemplate> SubStepTemplates { get; set; } = new List<ApplicationSubStepTemplate>();
    public virtual ICollection<ApplicationStep> Steps { get; set; } = new List<ApplicationStep>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

