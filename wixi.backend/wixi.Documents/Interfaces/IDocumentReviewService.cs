using wixi.Documents.DTOs;

namespace wixi.Documents.Interfaces
{
    public interface IDocumentReviewService
    {
        Task<List<DocumentDto>> GetPendingDocumentsAsync();
        Task<List<DocumentDto>> GetDocumentsByStatusAsync(string status);
        Task<DocumentDto> ReviewDocumentAsync(long documentId, DocumentReviewDto reviewDto, int reviewerId);
        Task<List<DocumentReviewDto>> GetDocumentReviewHistoryAsync(long documentId);
    }
}

