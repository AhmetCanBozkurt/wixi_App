namespace wixi.Applications.Entities;

/// <summary>
/// Represents an actual step in an application process
/// </summary>
public class ApplicationStep
{
    public long Id { get; set; }
    
    // Application relationship
    public long ApplicationId { get; set; }
    public virtual Application Application { get; set; } = null!;
    
    // Template relationship
    public int StepTemplateId { get; set; }
    public virtual ApplicationStepTemplate Template { get; set; } = null!;
    
    // Step info
    public string Title { get; set; } = string.Empty;  // "Denklik İşlemleri"
    public int StepOrder { get; set; }
    public StepStatus Status { get; set; } = StepStatus.NotStarted;
    public int ProgressPercentage { get; set; } = 0;
    
    // Dates
    public DateTime? StartDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public DateTime? DueDate { get; set; }
    
    // Additional info
    public string? Notes { get; set; }
    public string? AssignedTo { get; set; }  // Admin/Staff assigned
    
    // Relations
    public virtual ICollection<ApplicationSubStep> SubSteps { get; set; } = new List<ApplicationSubStep>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Computed properties
    public bool IsCompleted => Status == StepStatus.Completed;
    public bool IsActive => Status == StepStatus.InProgress;
    public TimeSpan? Duration => CompletionDate.HasValue && StartDate.HasValue 
        ? CompletionDate.Value - StartDate.Value 
        : null;
}

/// <summary>
/// Step status enum
/// </summary>
public enum StepStatus
{
    NotStarted = 1,
    InProgress = 2,
    Completed = 3,
    Blocked = 4,
    Skipped = 5,
    OnHold = 6
}

