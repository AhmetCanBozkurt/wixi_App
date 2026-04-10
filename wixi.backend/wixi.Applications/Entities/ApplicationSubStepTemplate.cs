namespace wixi.Applications.Entities;

/// <summary>
/// Represents a template for application sub-steps
/// Multi-language support: TR, EN, DE, AR
/// </summary>
public class ApplicationSubStepTemplate
{
    public int Id { get; set; }
    
    // Step template relationship
    public int StepTemplateId { get; set; }
    public virtual ApplicationStepTemplate StepTemplate { get; set; } = null!;
    
    // Multi-language Names (4 languages: TR, EN, DE, AR)
    public string Name_TR { get; set; } = string.Empty;  // "Belgeler Yüklendi"
    public string Name_EN { get; set; } = string.Empty;  // "Documents Uploaded"
    public string Name_DE { get; set; } = string.Empty;  // "Dokumente hochgeladen"
    public string Name_AR { get; set; } = string.Empty;  // "تم تحميل المستندات"
    
    // Multi-language Descriptions (4 languages: TR, EN, DE, AR)
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    // Configuration
    public int SubStepOrder { get; set; }
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
    
    // Duration estimate (in days)
    public int? EstimatedDurationDays { get; set; }
    
    // Relations
    public virtual ICollection<ApplicationSubStep> SubSteps { get; set; } = new List<ApplicationSubStep>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

