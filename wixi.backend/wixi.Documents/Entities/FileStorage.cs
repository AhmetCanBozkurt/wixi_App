namespace wixi.Documents.Entities;

/// <summary>
/// Represents a file stored in the system (local or cloud storage)
/// Polymorphic entity that can be used for any file type
/// </summary>
public class FileStorage
{
    public long Id { get; set; }
    
    // File info
    public string FileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;  // GUID-based
    public string FilePath { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = string.Empty;
    
    // Storage info
    public FileStorageType StorageType { get; set; } = FileStorageType.Local;
    public string? StorageUrl { get; set; }  // Full URL if cloud storage
    public string? ContainerName { get; set; }  // Azure: Container, AWS: Bucket
    public string? StoragePath { get; set; }  // Path within storage
    
    // Security
    public string? FileHash { get; set; }  // SHA256 hash
    public bool IsPublic { get; set; } = false;
    public bool IsEncrypted { get; set; } = false;
    public string? EncryptionKey { get; set; }
    
    // Relations (polymorphic - can be used for any entity)
    public string EntityType { get; set; } = string.Empty;  // "Document", "ProfilePhoto", "Attachment"
    public long EntityId { get; set; }
    
    // Metadata
    public string? UploadedBy { get; set; }
    public string? Description { get; set; }
    public string? MetadataJson { get; set; }  // Additional metadata as JSON
    
    // Timestamps
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastAccessedAt { get; set; }
    public DateTime? DeletedAt { get; set; }  // Soft delete
    
    // Computed properties
    public bool IsDeleted => DeletedAt.HasValue;
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
/// File storage type enum
/// </summary>
public enum FileStorageType
{
    Local = 1,
    AzureBlob = 2,
    AWSS3 = 3,
    GoogleCloud = 4
}

