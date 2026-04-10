namespace wixi.Documents.Entities;

/// <summary>
/// Represents a review/approval of a document by an admin/employee
/// </summary>
public class DocumentReview
{
    public long Id { get; set; }
    
    // Document relationship
    public long DocumentId { get; set; }
    public virtual Document Document { get; set; } = null!;
    
    // Reviewer relationship (User from Identity module)
    public int ReviewerId { get; set; }
    
    // Review decision
    public DocumentStatus Decision { get; set; }
    public string? ReviewNote { get; set; }  // Admin internal note
    public string? FeedbackMessage { get; set; }  // Message to client
    
    // Review details
    public int ReviewDurationMinutes { get; set; }  // How long review took
    public string? RejectionReason { get; set; }  // Categorized rejection reason
    
    // Timestamps
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

