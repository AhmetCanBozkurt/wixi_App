namespace wixi.Documents.DTOs;

public class DocumentReviewDto
{
    public long Id { get; set; }
    public long DocumentId { get; set; }
    public int ReviewerId { get; set; }
    public string? ReviewerName { get; set; }
    public string Decision { get; set; } = string.Empty;
    public string? ReviewNote { get; set; }
    public string? FeedbackMessage { get; set; }
    public int ReviewDurationMinutes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime ReviewedAt { get; set; }
}

public class CreateDocumentReviewDto
{
    public long DocumentId { get; set; }
    public int ReviewerId { get; set; }
    public string Decision { get; set; } = string.Empty;  // "Accepted", "Rejected", "MissingInfo"
    public string? ReviewNote { get; set; }
    public string? FeedbackMessage { get; set; }
    public string? RejectionReason { get; set; }
}

