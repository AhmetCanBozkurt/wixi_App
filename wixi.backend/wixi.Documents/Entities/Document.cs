using wixi.Clients.Entities;

namespace wixi.Documents.Entities;

/// <summary>
/// Represents a document uploaded by a client
/// </summary>
public class Document
{
    public long Id { get; set; }
    
    // Client relationship
    public int ClientId { get; set; }
    public virtual Client Client { get; set; } = null!;
    
    // Document type relationship
    public int DocumentTypeId { get; set; }
    public virtual DocumentType DocumentType { get; set; } = null!;
    
    // File info
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;  // GUID-based name
    public string FilePath { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? MimeType { get; set; }
    public string? FileHash { get; set; }  // SHA256 for integrity check
    
    // Status
    public DocumentStatus Status { get; set; } = DocumentStatus.Pending;
    public int Version { get; set; } = 1;  // Kaçıncı yükleme
    
    // Metadata
    public string? UploadedFromIp { get; set; }
    public string? UserAgent { get; set; }
    public string? Notes { get; set; }
    
    // Relations
    public virtual DocumentReview? Review { get; set; }
    
    // Timestamps
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }  // Soft delete
    public DateTime? ExpiresAt { get; set; }  // Document expiration
    
    // Computed properties
    public bool IsDeleted => DeletedAt.HasValue;
    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    public string FileSizeFormatted => FormatFileSize(FileSizeBytes);
    
    private static string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}

/// <summary>
/// Document status enum
/// </summary>
public enum DocumentStatus
{
    Pending = 1,       // Yüklendi, inceleme bekliyor
    UnderReview = 2,   // İnceleniyor
    Accepted = 3,      // Onaylandı
    Rejected = 4,      // Reddedildi
    MissingInfo = 5,   // Eksik bilgi var
    Expired = 6        // Süresi doldu
}

