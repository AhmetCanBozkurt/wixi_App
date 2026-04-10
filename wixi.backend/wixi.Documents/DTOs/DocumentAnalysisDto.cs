namespace wixi.Documents.DTOs;

/// <summary>
/// DTO for document analysis results
/// </summary>
public class DocumentAnalysisDto
{
    public int Id { get; set; }
    public long DocumentId { get; set; }
    public bool IsCV { get; set; }
    public int? ATSScore { get; set; }
    public string? Recommendations { get; set; }  // JSON array
    public DateTime AnalyzedAt { get; set; }
    public string? AnalysisMethod { get; set; }
}

