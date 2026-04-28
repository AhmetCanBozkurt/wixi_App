using System.ComponentModel.DataAnnotations;
using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiFile : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(255)]
    public required string FileName { get; set; }

    [MaxLength(500)]
    public required string FilePath { get; set; }

    [MaxLength(100)]
    public required string MimeType { get; set; }

    public long Size { get; set; }

    [MaxLength(50)]
    public string StorageProvider { get; set; } = "Local";

    public string? Extension { get; set; }
    
    // Optional: Reference to owner or entity
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }

    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
