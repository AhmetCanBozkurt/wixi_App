using wixi.Documents.DTOs;

namespace wixi.Documents.Interfaces;

/// <summary>
/// Interface for document analysis service (CV detection and ATS scoring)
/// </summary>
public interface IDocumentAnalysisService
{
    Task<DocumentAnalysisDto> AnalyzeDocumentAsync(long documentId);
    Task<DocumentAnalysisDto?> GetAnalysisByDocumentIdAsync(long documentId);
    Task<bool> DetectCVAsync(long documentId);
    Task<int> CalculateATSScoreAsync(long documentId);
}

