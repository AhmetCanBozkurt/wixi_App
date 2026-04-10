using wixi.Clients.Entities;

namespace wixi.Documents.Entities;

/// <summary>
/// Represents analysis results for a document (CV detection and ATS score)
/// </summary>
public class DocumentAnalysis
{
    public int Id { get; set; }
    
    // Document relation
    public long DocumentId { get; set; }
    public virtual Document Document { get; set; } = null!;
    
    // Analysis results
    public bool IsCV { get; set; }  // Whether the document is detected as a CV
    public int? ATSScore { get; set; }  // ATS compatibility score (0-100)
    public string? Recommendations { get; set; }  // JSON array of recommendations
    
    // Analysis metadata
    public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
    public string? AnalysisMethod { get; set; }  // "FileName", "Content", "Hybrid"
}

