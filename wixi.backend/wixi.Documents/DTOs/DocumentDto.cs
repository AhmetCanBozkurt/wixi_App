namespace wixi.Documents.DTOs;

public class DocumentDto
{
    public long Id { get; set; }
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public string? ClientEmail { get; set; }
    public string? ClientPhone { get; set; }
    public string? ClientCode { get; set; }
    public int DocumentTypeId { get; set; }
    public string? DocumentTypeName { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string FileSizeFormatted { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public string Status { get; set; } = string.Empty;
    public int Version { get; set; }
    public string? Notes { get; set; }
    public DateTime UploadedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsExpired { get; set; }
    public DocumentReviewDto? Review { get; set; }
}

public class CreateDocumentDto
{
    public int ClientId { get; set; }
    public int DocumentTypeId { get; set; }
    public string? Notes { get; set; }
    // File will be handled separately via IFormFile
}

public class UpdateDocumentDto
{
    public string? Notes { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class ClientDocumentListDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int TotalDocuments { get; set; }
    public int PendingDocuments { get; set; }
    public int AcceptedDocuments { get; set; }
    public int RejectedDocuments { get; set; }
    public int RequiredDocumentCount { get; set; }
    public List<DocumentDto> Documents { get; set; } = new();
}

