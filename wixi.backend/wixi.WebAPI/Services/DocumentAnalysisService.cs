using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Documents.DTOs;
using wixi.Documents.Entities;
using wixi.Documents.Interfaces;

namespace wixi.WebAPI.Services;

/// <summary>
/// Service for document analysis (CV detection and ATS scoring)
/// </summary>
public class DocumentAnalysisService : IDocumentAnalysisService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<DocumentAnalysisService> _logger;

    public DocumentAnalysisService(
        WixiDbContext context,
        ILogger<DocumentAnalysisService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<DocumentAnalysisDto> AnalyzeDocumentAsync(long documentId)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document == null)
            throw new Exception("Document not found");

        // Check if analysis already exists
        var existingAnalysis = await _context.DocumentAnalyses
            .FirstOrDefaultAsync(a => a.DocumentId == documentId);

        if (existingAnalysis != null)
        {
            return MapToDto(existingAnalysis);
        }

        // Perform analysis
        var isCV = await DetectCVAsync(documentId);
        int? atsScore = null;
        string? recommendations = null;

        if (isCV)
        {
            atsScore = await CalculateATSScoreAsync(documentId);
            recommendations = GenerateRecommendations(atsScore ?? 0);
        }

        var analysis = new DocumentAnalysis
        {
            DocumentId = documentId,
            IsCV = isCV,
            ATSScore = atsScore,
            Recommendations = recommendations,
            AnalyzedAt = DateTime.UtcNow,
            AnalysisMethod = "Hybrid" // FileName + Content
        };

        _context.DocumentAnalyses.Add(analysis);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Document analyzed. DocumentId: {DocumentId}, IsCV: {IsCV}, ATSScore: {ATSScore}", 
            documentId, isCV, atsScore);

        return MapToDto(analysis);
    }

    public async Task<DocumentAnalysisDto?> GetAnalysisByDocumentIdAsync(long documentId)
    {
        var analysis = await _context.DocumentAnalyses
            .FirstOrDefaultAsync(a => a.DocumentId == documentId);

        if (analysis == null)
            return null;

        return MapToDto(analysis);
    }

    public async Task<bool> DetectCVAsync(long documentId)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document == null)
            return false;

        // CV detection logic
        var fileName = document.OriginalFileName.ToLowerInvariant();
        var fileExtension = document.FileExtension.ToLowerInvariant();

        // Check file name for CV keywords
        var cvKeywords = new[] { "cv", "resume", "lebenslauf", "curriculum", "vitae" };
        var fileNameContainsCV = cvKeywords.Any(keyword => fileName.Contains(keyword));

        // Check file extension (PDF, DOC, DOCX are common CV formats)
        var isCVFormat = fileExtension == ".pdf" || fileExtension == ".doc" || fileExtension == ".docx";

        // Check document type code
        var documentType = await _context.DocumentTypes
            .FirstOrDefaultAsync(dt => dt.Id == document.DocumentTypeId);
        
        var isCVType = documentType?.Code?.ToLowerInvariant() == "cv";

        // If any criteria matches, consider it a CV
        var isCV = fileNameContainsCV || (isCVFormat && isCVType);

        _logger.LogInformation("CV detection. DocumentId: {DocumentId}, FileName: {FileName}, IsCV: {IsCV}", 
            documentId, fileName, isCV);

        return isCV;
    }

    public async Task<int> CalculateATSScoreAsync(long documentId)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (document == null)
            return 0;

        int score = 0;

        // Format check (20 points)
        var fileExtension = document.FileExtension.ToLowerInvariant();
        if (fileExtension == ".pdf" || fileExtension == ".docx")
        {
            score += 20;
        }

        // TODO: Implement content analysis
        // For now, we'll use basic heuristics
        // In production, this should:
        // 1. Extract text from PDF/DOCX
        // 2. Check for structured sections (headings, lists)
        // 3. Check for keywords
        // 4. Check for contact information
        // 5. Check for dates in proper format

        // Basic scoring based on file properties
        if (document.FileSizeBytes > 0 && document.FileSizeBytes < 5 * 1024 * 1024) // Less than 5MB
        {
            score += 10; // Reasonable file size
        }

        // If it's a PDF, assume better structure (30 points)
        if (fileExtension == ".pdf")
        {
            score += 30;
        }

        // If document type is CV, assume it has proper structure (30 points)
        var documentType = await _context.DocumentTypes
            .FirstOrDefaultAsync(dt => dt.Id == document.DocumentTypeId);
        
        if (documentType?.Code?.ToLowerInvariant() == "cv")
        {
            score += 30;
        }

        // Cap at 100
        score = Math.Min(score, 100);

        _logger.LogInformation("ATS score calculated. DocumentId: {DocumentId}, Score: {Score}", 
            documentId, score);

        return score;
    }

    private string? GenerateRecommendations(int atsScore)
    {
        var recommendations = new List<string>();

        if (atsScore < 50)
        {
            recommendations.Add("CV'niz ATS sistemleri için optimize edilmemiş. CV Builder kullanarak profesyonel bir CV oluşturun.");
        }
        else if (atsScore < 70)
        {
            recommendations.Add("CV'nizde bazı iyileştirmeler yapılabilir. ATS uyumlu format kullanın.");
            recommendations.Add("Görsel öğeler ve tablolar ATS sistemleri tarafından okunamaz.");
        }
        else if (atsScore < 90)
        {
            recommendations.Add("CV'niz iyi durumda, ancak daha fazla anahtar kelime ekleyerek skorunuzu artırabilirsiniz.");
        }

        return recommendations.Count > 0 ? System.Text.Json.JsonSerializer.Serialize(recommendations) : null;
    }

    private static DocumentAnalysisDto MapToDto(DocumentAnalysis analysis)
    {
        return new DocumentAnalysisDto
        {
            Id = analysis.Id,
            DocumentId = analysis.DocumentId,
            IsCV = analysis.IsCV,
            ATSScore = analysis.ATSScore,
            Recommendations = analysis.Recommendations,
            AnalyzedAt = analysis.AnalyzedAt,
            AnalysisMethod = analysis.AnalysisMethod
        };
    }
}

