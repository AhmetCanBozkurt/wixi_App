namespace wixi.Applications.Entities;

/// <summary>
/// Represents an actual sub-step in an application step
/// </summary>
public class ApplicationSubStep
{
    public long Id { get; set; }
    
    // Step relationship
    public long ApplicationStepId { get; set; }
    public virtual ApplicationStep Step { get; set; } = null!;
    
    // Template relationship
    public int SubStepTemplateId { get; set; }
    public virtual ApplicationSubStepTemplate Template { get; set; } = null!;
    
    // Sub-step info
    public string Name { get; set; } = string.Empty;  // "Belgeler Yüklendi"
    public int SubStepOrder { get; set; }
    public StepStatus Status { get; set; } = StepStatus.NotStarted;
    
    // Additional info
    public string? FileNumber { get; set; }  // "DEU-2023-45678"
    public string? InfoMessage { get; set; }  // "Başvuru işleme alındı"
    public string? Notes { get; set; }
    public DateTime? CompletionDate { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Computed properties
    public bool IsCompleted => Status == StepStatus.Completed;
}

