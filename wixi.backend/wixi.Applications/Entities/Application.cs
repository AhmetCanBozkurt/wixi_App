namespace wixi.Applications.Entities;

/// <summary>
/// Represents a client's application (Recognition, Work Permit, Visa, or Full Process)
/// </summary>
public class Application
{
    public long Id { get; set; }
    
    // Client relationship
    public int ClientId { get; set; }
    
    // Template relationship
    public int ApplicationTemplateId { get; set; }
    public virtual ApplicationTemplate Template { get; set; } = null!;
    
    // Application info
    public string ApplicationNumber { get; set; } = string.Empty;  // "APP-2023-12345"
    public ApplicationType Type { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;
    public int ProgressPercentage { get; set; } = 0;
    
    // Dates
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletionDate { get; set; }
    public DateTime? ExpectedCompletionDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    
    // Additional info
    public string? Description { get; set; }
    public string? CancellationReason { get; set; }
    public string? Notes { get; set; }
    
    // Relations
    public virtual ICollection<ApplicationStep> Steps { get; set; } = new List<ApplicationStep>();
    public virtual ICollection<ApplicationHistory> History { get; set; } = new List<ApplicationHistory>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Computed properties
    public bool IsActive => Status == ApplicationStatus.InProgress || Status == ApplicationStatus.Submitted;
    public bool IsCompleted => Status == ApplicationStatus.Completed;
    public TimeSpan? Duration => CompletionDate.HasValue ? CompletionDate.Value - StartDate : null;
}

/// <summary>
/// Application type enum
/// </summary>
public enum ApplicationType
{
    Recognition = 1,      // Denklik İşlemleri
    WorkPermit = 2,       // Çalışma İzni
    Visa = 3,             // Vize İşlemleri
    FullProcess = 4       // Tam Süreç (Hepsi)
}

/// <summary>
/// Application status enum
/// </summary>
public enum ApplicationStatus
{
    Draft = 1,           // Taslak
    Submitted = 2,       // Başvuruldu
    InProgress = 3,      // İşlemde
    Completed = 4,       // Tamamlandı
    Cancelled = 5,       // İptal edildi
    OnHold = 6,          // Beklemede
    Rejected = 7         // Reddedildi
}

