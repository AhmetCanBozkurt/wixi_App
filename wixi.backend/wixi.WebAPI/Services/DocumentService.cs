using Microsoft.EntityFrameworkCore;
using System.Linq;
using wixi.DataAccess;
using wixi.Documents.Entities;
using wixi.Documents.DTOs;
using wixi.Documents.Interfaces;
using wixi.Applications.Entities;
using wixi.Email.Interfaces;
using wixi.Email.DTOs;

namespace wixi.WebAPI.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly WixiDbContext _context;
        private readonly IFileStorageService _fileStorageService;
        private readonly ILogger<DocumentService> _logger;
        private readonly IEmailSender _emailSender;
        private readonly IEmailTemplateService _emailTemplateService;

        public DocumentService(
            WixiDbContext context,
            IFileStorageService fileStorageService,
            ILogger<DocumentService> logger,
            IEmailSender emailSender,
            IEmailTemplateService emailTemplateService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _emailSender = emailSender;
            _emailTemplateService = emailTemplateService;
        }

        public async Task<DocumentDto> UploadDocumentAsync(int clientId, int documentTypeId, IFormFile file)
        {
            // Validate client exists
            var clientExists = await _context.Clients.AnyAsync(c => c.Id == clientId);
            if (!clientExists)
            {
                throw new Exception("Client not found");
            }

            // Get document type
            var documentType = await _context.DocumentTypes.FindAsync(documentTypeId);
            if (documentType == null || !documentType.IsActive)
            {
                throw new Exception("Document type not found or inactive");
            }

            // Validate file
            var allowedExtensions = documentType.AllowedFileTypes?.Split(',')
                .Select(e => e.Trim())
                .ToArray() ?? new[] { ".pdf", ".jpg", ".jpeg", ".png" };

            var maxSize = documentType.MaxFileSizeBytes ?? 10485760; // 10MB default

            var validationResult = await _fileStorageService.ValidateFileAsync(file, allowedExtensions, maxSize);
            if (!validationResult.IsValid)
            {
                throw new Exception(string.Join(", ", validationResult.Errors));
            }

            // Check if document already exists for this type (get version and find existing active documents)
            var existingDocuments = await _context.Documents
                .Where(d => d.ClientId == clientId && d.DocumentTypeId == documentTypeId && d.DeletedAt == null)
                .ToListAsync();

            var existingCount = await _context.Documents
                .Where(d => d.ClientId == clientId && d.DocumentTypeId == documentTypeId)
                .CountAsync();

            // Soft delete existing active documents of the same type
            // This ensures only the latest version is active
            foreach (var existingDoc in existingDocuments)
            {
                existingDoc.DeletedAt = DateTime.UtcNow;
                _logger.LogInformation("Soft deleting previous document. DocumentId: {DocumentId}, ClientId: {ClientId}, DocumentTypeId: {DocumentTypeId}",
                    existingDoc.Id, clientId, documentTypeId);
                
                // Optionally delete the physical file of the old document
                // Commented out to keep file history, uncomment if you want to delete old files
                // await _fileStorageService.DeleteFileAsync(existingDoc.FilePath);
            }

            // Upload file
            var uploadResult = await _fileStorageService.UploadFileAsync(file, $"client-{clientId}");

            if (!uploadResult.Success)
            {
                throw new Exception(uploadResult.ErrorMessage ?? "File upload failed");
            }

            // Create document entity
            var document = new Document
            {
                ClientId = clientId,
                DocumentTypeId = documentTypeId,
                OriginalFileName = uploadResult.FileName!,
                StoredFileName = uploadResult.StoredFileName!,
                FilePath = uploadResult.FilePath!,
                FileExtension = uploadResult.FileExtension!,
                FileSizeBytes = uploadResult.FileSizeBytes,
                MimeType = uploadResult.MimeType ?? "application/octet-stream",
                Status = DocumentStatus.Pending,
                Version = existingCount + 1,
                UploadedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Document uploaded successfully. DocumentId: {DocumentId}, ClientId: {ClientId}",
                document.Id, clientId);

            return await GetDocumentByIdAsync(document.Id);
        }

        public async Task<ClientDocumentListDto> GetClientDocumentsAsync(int clientId)
        {
            // Get client information
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId);
            
            if (client == null)
            {
                throw new Exception("Client not found");
            }

            // Get all documents for the client
            var documents = await _context.Documents
                .Include(d => d.DocumentType)
                .Include(d => d.Review)
                .Include(d => d.Client)
                .Where(d => d.ClientId == clientId && d.DeletedAt == null)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();

            // Calculate required document count based on education type
            int requiredDocumentCount = 0;
            if (client.EducationTypeId.HasValue)
            {
                // Get count of active and required document types for this education type
                requiredDocumentCount = await _context.DocumentTypes
                    .CountAsync(dt => dt.EducationTypeId == client.EducationTypeId.Value 
                                   && dt.IsActive 
                                   && dt.IsRequired);
            }

            // Calculate statistics
            var totalDocuments = documents.Count;
            var pendingDocuments = documents.Count(d => 
                d.Status == DocumentStatus.Pending || 
                d.Status == DocumentStatus.UnderReview);
            var acceptedDocuments = documents.Count(d => 
                d.Status == DocumentStatus.Accepted ||
                (d.Review != null && d.Review.Decision == DocumentStatus.Accepted));
            var rejectedDocuments = documents.Count(d => 
                d.Status == DocumentStatus.Rejected ||
                (d.Review != null && d.Review.Decision == DocumentStatus.Rejected));

            // Map documents to DTOs - Client is already included
            var documentDtos = documents.Select(d => MapToDocumentDto(d)).ToList();

            // Get client name
            var clientName = !string.IsNullOrEmpty(client.FullName) 
                ? client.FullName 
                : $"{client.FirstName} {client.LastName}".Trim();

            return new ClientDocumentListDto
            {
                ClientId = clientId,
                ClientName = clientName,
                TotalDocuments = totalDocuments,
                PendingDocuments = pendingDocuments,
                AcceptedDocuments = acceptedDocuments,
                RejectedDocuments = rejectedDocuments,
                RequiredDocumentCount = requiredDocumentCount,
                Documents = documentDtos
            };
        }

        public async Task<DocumentDto> GetDocumentByIdAsync(long documentId)
        {
            var document = await _context.Documents
                .Include(d => d.DocumentType)
                .Include(d => d.Review)
                .Include(d => d.Client)
                .FirstOrDefaultAsync(d => d.Id == documentId && d.DeletedAt == null);

            if (document == null)
            {
                throw new Exception("Document not found");
            }

            return MapToDocumentDto(document);
        }

        public async Task<bool> DeleteDocumentAsync(long documentId, int clientId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.ClientId == clientId && d.DeletedAt == null);

            if (document == null)
            {
                throw new Exception("Document not found");
            }

            // Soft delete
            document.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Delete physical file
            await _fileStorageService.DeleteFileAsync(document.FilePath);

            _logger.LogInformation("Document deleted. DocumentId: {DocumentId}, ClientId: {ClientId}",
                documentId, clientId);

            return true;
        }

        public async Task<List<DocumentTypeDto>> GetDocumentTypesByEducationAsync(int educationTypeId)
        {
            var documentTypes = await _context.DocumentTypes
                .Where(dt => dt.EducationTypeId == educationTypeId && dt.IsActive)
                .OrderBy(dt => dt.DisplayOrder)
                .ToListAsync();

            return documentTypes.Select(dt => MapToDocumentTypeDto(dt)).ToList();
        }

        public async Task<List<DocumentTypeDto>> GetAllDocumentTypesAsync()
        {
            var documentTypes = await _context.DocumentTypes
                .Where(dt => dt.IsActive)
                .OrderBy(dt => dt.EducationTypeId)
                    .ThenBy(dt => dt.DisplayOrder)
                .ToListAsync();

            return documentTypes.Select(dt => MapToDocumentTypeDto(dt)).ToList();
        }

        public async Task<DocumentTypeDto> CreateDocumentTypeAsync(DocumentTypeDto documentTypeDto)
        {
            if (documentTypeDto == null)
            {
                throw new ArgumentNullException(nameof(documentTypeDto));
            }

            if (string.IsNullOrWhiteSpace(documentTypeDto.Name_TR))
            {
                throw new ArgumentException("Turkish name is required", nameof(documentTypeDto));
            }

            var normalizedCode = NormalizeDocumentTypeCode(documentTypeDto.Code);

            var codeExists = await _context.DocumentTypes.AnyAsync(dt => dt.Code == normalizedCode);
            if (codeExists)
            {
                throw new InvalidOperationException("Document type code already exists");
            }

            var nextDisplayOrder = documentTypeDto.DisplayOrder > 0
                ? documentTypeDto.DisplayOrder
                : ((await _context.DocumentTypes.MaxAsync(dt => (int?)dt.DisplayOrder)) ?? 0) + 1;

            var documentType = new DocumentType
            {
                Code = normalizedCode,
                Name_TR = documentTypeDto.Name_TR?.Trim() ?? string.Empty,
                Name_EN = documentTypeDto.Name_EN?.Trim() ?? string.Empty,
                Name_DE = documentTypeDto.Name_DE?.Trim() ?? string.Empty,
                Name_AR = documentTypeDto.Name_AR?.Trim() ?? string.Empty,
                Description_TR = documentTypeDto.Description_TR?.Trim(),
                Description_EN = documentTypeDto.Description_EN?.Trim(),
                Description_DE = documentTypeDto.Description_DE?.Trim(),
                Description_AR = documentTypeDto.Description_AR?.Trim(),
                Note_TR = documentTypeDto.Note_TR?.Trim(),
                Note_EN = documentTypeDto.Note_EN?.Trim(),
                Note_DE = documentTypeDto.Note_DE?.Trim(),
                Note_AR = documentTypeDto.Note_AR?.Trim(),
                IsRequired = documentTypeDto.IsRequired,
                IsActive = true,
                EducationTypeId = documentTypeDto.EducationTypeId,
                AllowedFileTypes = NormalizeFileTypes(documentTypeDto.AllowedFileTypes),
                MaxFileSizeBytes = NormalizeFileSize(documentTypeDto.MaxFileSizeBytes),
                RequiresApproval = documentTypeDto.RequiresApproval,
                DisplayOrder = nextDisplayOrder,
                IconName = documentTypeDto.IconName,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentTypes.Add(documentType);
            await _context.SaveChangesAsync();

            return MapToDocumentTypeDto(documentType);
        }

        public async Task<DocumentTypeDto> UpdateDocumentTypeAsync(int id, DocumentTypeDto documentTypeDto)
        {
            if (documentTypeDto == null)
            {
                throw new ArgumentNullException(nameof(documentTypeDto));
            }

            if (string.IsNullOrWhiteSpace(documentTypeDto.Name_TR))
            {
                throw new ArgumentException("Turkish name is required", nameof(documentTypeDto));
            }

            var documentType = await _context.DocumentTypes.FirstOrDefaultAsync(dt => dt.Id == id);
            if (documentType == null)
            {
                throw new KeyNotFoundException("Document type not found");
            }

            var normalizedCode = NormalizeDocumentTypeCode(documentTypeDto.Code);

            var codeExists = await _context.DocumentTypes
                .AnyAsync(dt => dt.Code == normalizedCode && dt.Id != id);
            if (codeExists)
            {
                throw new InvalidOperationException("Document type code already exists");
            }

            documentType.Code = normalizedCode;
            documentType.Name_TR = documentTypeDto.Name_TR?.Trim() ?? documentType.Name_TR;
            documentType.Name_EN = documentTypeDto.Name_EN?.Trim() ?? documentType.Name_EN;
            documentType.Name_DE = documentTypeDto.Name_DE?.Trim() ?? documentType.Name_DE;
            documentType.Name_AR = documentTypeDto.Name_AR?.Trim() ?? documentType.Name_AR;
            documentType.Description_TR = documentTypeDto.Description_TR?.Trim();
            documentType.Description_EN = documentTypeDto.Description_EN?.Trim();
            documentType.Description_DE = documentTypeDto.Description_DE?.Trim();
            documentType.Description_AR = documentTypeDto.Description_AR?.Trim();
            documentType.Note_TR = documentTypeDto.Note_TR?.Trim();
            documentType.Note_EN = documentTypeDto.Note_EN?.Trim();
            documentType.Note_DE = documentTypeDto.Note_DE?.Trim();
            documentType.Note_AR = documentTypeDto.Note_AR?.Trim();
            documentType.IsRequired = documentTypeDto.IsRequired;
            documentType.IsActive = documentTypeDto.IsActive;
            documentType.EducationTypeId = documentTypeDto.EducationTypeId;
            documentType.AllowedFileTypes = NormalizeFileTypes(documentTypeDto.AllowedFileTypes);
            documentType.MaxFileSizeBytes = NormalizeFileSize(documentTypeDto.MaxFileSizeBytes);
            documentType.RequiresApproval = documentTypeDto.RequiresApproval;
            documentType.DisplayOrder = documentTypeDto.DisplayOrder > 0
                ? documentTypeDto.DisplayOrder
                : documentType.DisplayOrder;
            documentType.IconName = string.IsNullOrWhiteSpace(documentTypeDto.IconName)
                ? documentType.IconName
                : documentTypeDto.IconName;
            documentType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDocumentTypeDto(documentType);
        }

        public async Task<bool> DeleteDocumentTypeAsync(int id)
        {
            var documentType = await _context.DocumentTypes.FirstOrDefaultAsync(dt => dt.Id == id);
            if (documentType == null)
            {
                throw new KeyNotFoundException("Document type not found");
            }

            documentType.IsActive = false;
            documentType.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<(Stream stream, string fileName, string contentType)> DownloadDocumentAsync(long documentId)
        {
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.Id == documentId && d.DeletedAt == null);

            if (document == null)
            {
                throw new Exception("Document not found");
            }

            var stream = await _fileStorageService.GetFileStreamAsync(document.FilePath);

            if (stream == null)
            {
                throw new Exception("File not found on server");
            }

            var contentType = document.MimeType ?? "application/octet-stream";

            return (stream, document.OriginalFileName, contentType);
        }

        // Helper methods
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

            // Calculate file size formatted
            string fileSizeFormatted = FormatFileSize(document.FileSizeBytes);

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
                FilePath = document.FilePath,
                FileSizeBytes = document.FileSizeBytes,
                FileSizeFormatted = fileSizeFormatted,
                FileExtension = document.FileExtension,
                Status = document.Status.ToString(),
                Version = document.Version,
                Notes = document.Notes,
                UploadedAt = document.UploadedAt,
                UpdatedAt = document.UpdatedAt,
                Review = reviewDto
            };
        }

        private DocumentTypeDto MapToDocumentTypeDto(DocumentType dt)
        {
            return new DocumentTypeDto
            {
                Id = dt.Id,
                Code = dt.Code,
                Name_TR = dt.Name_TR,
                Name_EN = dt.Name_EN,
                Name_DE = dt.Name_DE,
                Name_AR = dt.Name_AR,
                Description_TR = dt.Description_TR,
                Description_EN = dt.Description_EN,
                Description_DE = dt.Description_DE,
                Description_AR = dt.Description_AR,
                Note_TR = dt.Note_TR,
                Note_EN = dt.Note_EN,
                Note_DE = dt.Note_DE,
                Note_AR = dt.Note_AR,
                IsRequired = dt.IsRequired,
                IsActive = dt.IsActive,
                EducationTypeId = dt.EducationTypeId,
                AllowedFileTypes = dt.AllowedFileTypes,
                MaxFileSizeBytes = dt.MaxFileSizeBytes,
                RequiresApproval = dt.RequiresApproval,
                DisplayOrder = dt.DisplayOrder,
                IconName = dt.IconName
            };
        }

        private static string NormalizeDocumentTypeCode(string? code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Document type code is required", nameof(code));
            }

            return code.Trim().ToLowerInvariant();
        }

        private static string? NormalizeFileTypes(string? allowedFileTypes)
        {
            if (string.IsNullOrWhiteSpace(allowedFileTypes))
            {
                return null;
            }

            var normalized = allowedFileTypes
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(type => type.Trim())
                .Where(type => !string.IsNullOrWhiteSpace(type))
                .Select(type => type.StartsWith(".", StringComparison.Ordinal)
                    ? type.ToLowerInvariant()
                    : $".{type.ToLowerInvariant()}")
                .Distinct();

            return string.Join(",", normalized);
        }

        private static long? NormalizeFileSize(long? fileSize)
        {
            if (!fileSize.HasValue || fileSize.Value <= 0)
            {
                return null;
            }

            return fileSize.Value;
        }

        private static string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }

        public async Task<DocumentDto> UploadDocumentForClientAsync(
            int clientId,
            string documentTypeCode,
            IFormFile file,
            int adminUserId,
            string? notes = null)
        {
            _logger.LogInformation("Admin {AdminUserId} uploading document type '{DocumentTypeCode}' for client {ClientId}",
                adminUserId, documentTypeCode, clientId);

            // Validate client exists and get client info
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == clientId);

            if (client == null)
            {
                throw new Exception("Client not found");
            }

            // Get document type by code
            var documentType = await _context.DocumentTypes
                .FirstOrDefaultAsync(dt => dt.Code == documentTypeCode && dt.IsActive);

            if (documentType == null)
            {
                throw new Exception($"Document type '{documentTypeCode}' not found or inactive");
            }

            // Upload document using existing logic
            var document = await UploadDocumentAsync(clientId, documentType.Id, file);

            // Automatically mark as Accepted since admin is uploading
            var documentEntity = await _context.Documents.FindAsync(document.Id);
            if (documentEntity != null)
            {
                documentEntity.Status = DocumentStatus.Accepted;
                documentEntity.Notes = notes ?? "Admin tarafından yüklendi";
                documentEntity.UpdatedAt = DateTime.UtcNow;

                // Create review record
                var review = new DocumentReview
                {
                    DocumentId = document.Id,
                    ReviewerId = adminUserId,
                    Decision = DocumentStatus.Accepted,
                    ReviewNote = notes ?? "Admin tarafından yüklendi ve otomatik onaylandı",
                    FeedbackMessage = "Belgeniz başarıyla yüklendi ve onaylandı.",
                    ReviewedAt = DateTime.UtcNow
                };

                _context.DocumentReviews.Add(review);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Document {DocumentId} marked as Accepted by admin {AdminUserId}",
                    document.Id, adminUserId);
            }

            // Update application steps if this is Diploma (Denklik Belgesi)
            if (documentTypeCode.ToLower() == "diploma" || documentTypeCode.ToLower() == "denklik_belgesi")
            {
                await UpdateApplicationStepsForDenklikBelgesiAsync(clientId);
            }

            // Send email notification to client
            await SendDocumentUploadedEmailAsync(client, documentType.Name_TR, documentTypeCode);

            _logger.LogInformation("Document uploaded successfully for client {ClientId} by admin {AdminUserId}",
                clientId, adminUserId);

            return await GetDocumentByIdAsync(document.Id);
        }

        private async Task UpdateApplicationStepsForDenklikBelgesiAsync(int clientId)
        {
            _logger.LogInformation("Updating application steps for client {ClientId} after Denklik Belgesi upload", clientId);

            // Find client's active application
            var application = await _context.Applications
                .Include(a => a.Steps)
                    .ThenInclude(s => s.SubSteps)
                .Where(a => a.ClientId == clientId && 
                       (a.Status == ApplicationStatus.InProgress || a.Status == ApplicationStatus.Submitted))
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync();

            if (application == null)
            {
                _logger.LogWarning("No active application found for client {ClientId}", clientId);
                return;
            }

            // Find Step 1 (Denklik İşlemleri) and mark as Completed
            var step1 = application.Steps
                .Where(s => s.StepOrder == 1)
                .FirstOrDefault();

            if (step1 != null && step1.Status != StepStatus.Completed)
            {
                step1.Status = StepStatus.Completed;
                step1.CompletionDate = DateTime.UtcNow;
                step1.ProgressPercentage = 100;
                step1.UpdatedAt = DateTime.UtcNow;

                // Mark all substeps of Step 1 as Completed
                foreach (var subStep in step1.SubSteps)
                {
                    if (subStep.Status != StepStatus.Completed)
                    {
                        subStep.Status = StepStatus.Completed;
                        subStep.CompletionDate = DateTime.UtcNow;
                        subStep.UpdatedAt = DateTime.UtcNow;
                    }
                }

                _logger.LogInformation("Step 1 (Denklik İşlemleri) marked as Completed for application {ApplicationId}",
                    application.Id);
            }

            // Find Step 2 and its first SubStep, mark SubStep as InProgress
            var step2 = application.Steps
                .Where(s => s.StepOrder == 2)
                .FirstOrDefault();

            if (step2 != null)
            {
                // Mark Step 2 as InProgress if not already
                if (step2.Status == StepStatus.NotStarted)
                {
                    step2.Status = StepStatus.InProgress;
                    step2.StartDate = DateTime.UtcNow;
                    step2.UpdatedAt = DateTime.UtcNow;

                    _logger.LogInformation("Step 2 marked as InProgress for application {ApplicationId}",
                        application.Id);
                }

                // Find first SubStep of Step 2 and mark as InProgress
                var firstSubStep = step2.SubSteps
                    .OrderBy(ss => ss.SubStepOrder)
                    .FirstOrDefault();

                if (firstSubStep != null && firstSubStep.Status == StepStatus.NotStarted)
                {
                    firstSubStep.Status = StepStatus.InProgress;
                    firstSubStep.UpdatedAt = DateTime.UtcNow;

                    _logger.LogInformation("Step 2, SubStep 1 ('{SubStepName}') marked as InProgress for application {ApplicationId}",
                        firstSubStep.Name, application.Id);
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Application steps updated successfully for client {ClientId}", clientId);
        }

        private async Task SendDocumentUploadedEmailAsync(Clients.Entities.Client client, string documentTypeName, string documentTypeCode)
        {
            if (_emailSender == null || _emailTemplateService == null)
            {
                _logger.LogWarning("Email services not available, skipping email for client {ClientId}", client.Id);
                return;
            }

            try
            {
                // Get email template for document uploaded notification
                var templateDto = await _emailTemplateService.GetByKeyAsync("DocumentApproved");

                if (templateDto == null || !templateDto.IsActive)
                {
                    _logger.LogWarning("Email template 'DocumentApproved' not found or inactive");
                    return;
                }

                // Determine language (default to TR if not available)
                var emailLanguage = "tr"; // TODO: Get from client preferences

                string emailSubject = emailLanguage switch
                {
                    "tr" => templateDto.Subject_TR ?? templateDto.Subject_EN ?? "Belgeniz Yüklendi",
                    "en" => templateDto.Subject_EN ?? templateDto.Subject_TR ?? "Your Document Has Been Uploaded",
                    "de" => templateDto.Subject_DE ?? templateDto.Subject_EN ?? "Ihr Dokument wurde hochgeladen",
                    "ar" => templateDto.Subject_AR ?? templateDto.Subject_EN ?? "تم تحميل وثيقتك",
                    _ => templateDto.Subject_TR ?? "Belgeniz Yüklendi"
                };

                string emailBody = emailLanguage switch
                {
                    "tr" => templateDto.BodyHtml_TR ?? templateDto.BodyHtml_EN ?? "",
                    "en" => templateDto.BodyHtml_EN ?? templateDto.BodyHtml_TR ?? "",
                    "de" => templateDto.BodyHtml_DE ?? templateDto.BodyHtml_EN ?? "",
                    "ar" => templateDto.BodyHtml_AR ?? templateDto.BodyHtml_EN ?? "",
                    _ => templateDto.BodyHtml_TR ?? ""
                };

                // Replace placeholders
                var clientFullName = $"{client.FirstName} {client.LastName}";
                emailBody = emailBody
                    .Replace("{{FirstName}}", client.FirstName)
                    .Replace("{{LastName}}", client.LastName)
                    .Replace("{{FullName}}", clientFullName)
                    .Replace("{{DocumentType}}", documentTypeName)
                    .Replace("{{DocumentTypeName}}", documentTypeName)
                    .Replace("{{ClientCode}}", client.ClientCode)
                    .Replace("{{UploadDate}}", DateTime.UtcNow.ToString("dd/MM/yyyy"));

                emailSubject = emailSubject
                    .Replace("{{DocumentType}}", documentTypeName)
                    .Replace("{{DocumentTypeName}}", documentTypeName);

                var emailMessage = new EmailMessage
                {
                    To = new List<string> { client.Email },
                    Subject = emailSubject,
                    BodyHtml = emailBody,
                    TemplateKey = "DocumentApproved",
                    CorrelationId = Guid.NewGuid().ToString(),
                    Metadata = new Dictionary<string, string>
                    {
                        { "Type", "DocumentUploaded" },
                        { "ClientId", client.Id.ToString() },
                        { "DocumentTypeCode", documentTypeCode },
                        { "DocumentTypeName", documentTypeName }
                    }
                };

                await _emailSender.SendAsync(emailMessage);

                _logger.LogInformation("Document uploaded email sent to client {ClientId} ({Email})",
                    client.Id, client.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending document uploaded email to client {ClientId}", client.Id);
                // Don't fail the document upload if email fails
            }
        }
    }
}

