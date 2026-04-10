using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Documents.Entities;
using wixi.Documents.DTOs;
using wixi.Documents.Interfaces;

namespace wixi.WebAPI.Services
{
    public class DocumentReviewService : IDocumentReviewService
    {
        private readonly WixiDbContext _context;
        private readonly ILogger<DocumentReviewService> _logger;

        public DocumentReviewService(
            WixiDbContext context,
            ILogger<DocumentReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<DocumentDto>> GetPendingDocumentsAsync()
        {
            var documents = await _context.Documents
                .Include(d => d.DocumentType)
                .Include(d => d.Client)
                .Include(d => d.Review)
                .Where(d => d.Status == DocumentStatus.Pending && d.DeletedAt == null)
                .AsSplitQuery() // Use split query to avoid cartesian explosion
                .OrderBy(d => d.UploadedAt)
                .ToListAsync();

            // Ensure all related entities are loaded
            foreach (var doc in documents)
            {
                if (doc.Client == null && doc.ClientId > 0)
                {
                    await _context.Entry(doc).Reference(d => d.Client).LoadAsync();
                }
                if (doc.DocumentType == null && doc.DocumentTypeId > 0)
                {
                    await _context.Entry(doc).Reference(d => d.DocumentType).LoadAsync();
                }
            }

            return documents.Select(d => MapToDocumentDto(d)).ToList();
        }

        public async Task<List<DocumentDto>> GetDocumentsByStatusAsync(string status)
        {
            if (!Enum.TryParse<DocumentStatus>(status, true, out var documentStatus))
            {
                throw new Exception($"Invalid document status: {status}");
            }

            var documents = await _context.Documents
                .Include(d => d.DocumentType)
                .Include(d => d.Client)
                .Include(d => d.Review)
                .Where(d => d.Status == documentStatus && d.DeletedAt == null)
                .AsSplitQuery() // Use split query to avoid cartesian explosion
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            // Ensure all related entities are loaded
            foreach (var doc in documents)
            {
                if (doc.Client == null && doc.ClientId > 0)
                {
                    await _context.Entry(doc).Reference(d => d.Client).LoadAsync();
                }
                if (doc.DocumentType == null && doc.DocumentTypeId > 0)
                {
                    await _context.Entry(doc).Reference(d => d.DocumentType).LoadAsync();
                }
            }

            return documents.Select(d => MapToDocumentDto(d)).ToList();
        }

        public async Task<DocumentDto> ReviewDocumentAsync(long documentId, DocumentReviewDto reviewDto, int reviewerId)
        {
            var document = await _context.Documents
                .Include(d => d.DocumentType)
                .Include(d => d.Client)
                .Include(d => d.Review)
                .FirstOrDefaultAsync(d => d.Id == documentId && d.DeletedAt == null);

            if (document == null)
            {
                throw new Exception("Document not found");
            }

            // Parse decision
            if (!Enum.TryParse<DocumentStatus>(reviewDto.Decision, true, out var decision))
            {
                throw new Exception($"Invalid review decision: {reviewDto.Decision}");
            }

            // Update document status based on decision
            document.Status = decision;

            // Create or update review
            if (document.Review == null)
            {
                document.Review = new DocumentReview
                {
                    DocumentId = documentId,
                    ReviewerId = reviewerId,
                    Decision = decision,
                    ReviewNote = reviewDto.ReviewNote,
                    FeedbackMessage = reviewDto.FeedbackMessage,
                    ReviewedAt = DateTime.UtcNow
                };
                _context.DocumentReviews.Add(document.Review);
            }
            else
            {
                document.Review.ReviewerId = reviewerId;
                document.Review.Decision = decision;
                document.Review.ReviewNote = reviewDto.ReviewNote;
                document.Review.FeedbackMessage = reviewDto.FeedbackMessage;
                document.Review.ReviewedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Document {DocumentId} reviewed with decision {Decision} by reviewer {ReviewerId}",
                documentId, decision, reviewerId);

            return MapToDocumentDto(document);
        }

        public async Task<List<DocumentReviewDto>> GetDocumentReviewHistoryAsync(long documentId)
        {
            var reviews = await _context.DocumentReviews
                .Where(r => r.DocumentId == documentId)
                .OrderByDescending(r => r.ReviewedAt)
                .ToListAsync();

            return reviews.Select(r => new DocumentReviewDto
            {
                DocumentId = r.DocumentId,
                Decision = r.Decision.ToString(),
                ReviewNote = r.ReviewNote,
                FeedbackMessage = r.FeedbackMessage
            }).ToList();
        }

        private DocumentDto MapToDocumentDto(Document document)
        {
            // Get document type name (default to TR, frontend will handle language switching)
            string? documentTypeName = null;
            if (document.DocumentType != null)
            {
                documentTypeName = document.DocumentType.Name_TR ?? 
                                 document.DocumentType.Name_EN ?? 
                                 document.DocumentType.Name_DE ?? 
                                 document.DocumentType.Name_AR;
            }

            // Get client information
            string? clientName = null;
            string? clientEmail = null;
            string? clientPhone = null;
            string? clientCode = null;
            
            if (document.Client != null)
            {
                clientName = !string.IsNullOrEmpty(document.Client.FullName) 
                    ? document.Client.FullName 
                    : $"{document.Client.FirstName} {document.Client.LastName}".Trim();
                clientEmail = document.Client.Email;
                clientPhone = document.Client.Phone;
                clientCode = document.Client.ClientCode;
            }
            else if (document.ClientId > 0)
            {
                // Client was not loaded via Include - this should not happen if explicit loading works
                // But log it for debugging
                _logger.LogWarning("Client navigation property is null for DocumentId: {DocumentId}, ClientId: {ClientId}. " +
                    "This may indicate a problem with entity loading or the client does not exist.", 
                    document.Id, document.ClientId);
            }

            // Get review information
            var reviewDto = document.Review != null ? new DocumentReviewDto
            {
                Id = document.Review.Id,
                DocumentId = document.Review.DocumentId,
                ReviewerId = document.Review.ReviewerId,
                Decision = document.Review.Decision.ToString(),
                ReviewNote = document.Review.ReviewNote,
                FeedbackMessage = document.Review.FeedbackMessage,
                ReviewedAt = document.Review.ReviewedAt
            } : null;

            return new DocumentDto
            {
                Id = document.Id,
                ClientId = document.ClientId,
                ClientName = clientName,
                ClientEmail = clientEmail,
                ClientPhone = clientPhone,
                ClientCode = clientCode,
                DocumentTypeId = document.DocumentTypeId,
                DocumentTypeName = documentTypeName,
                OriginalFileName = document.OriginalFileName,
                StoredFileName = document.StoredFileName,
                FilePath = document.FilePath,
                FileSizeBytes = document.FileSizeBytes,
                FileSizeFormatted = document.FileSizeFormatted,
                FileExtension = document.FileExtension,
                MimeType = document.MimeType,
                Status = document.Status.ToString(),
                Version = document.Version,
                Notes = document.Notes,
                UploadedAt = document.UploadedAt,
                UpdatedAt = document.UpdatedAt,
                ExpiresAt = document.ExpiresAt,
                IsExpired = document.IsExpired,
                Review = reviewDto
            };
        }
    }
}

