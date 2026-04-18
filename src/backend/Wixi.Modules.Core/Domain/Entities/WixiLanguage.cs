using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiLanguage : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty; // tr-TR, en-US
    public string Name { get; set; } = string.Empty; // Türkçe, English
    public bool IsDefault { get; set; }
    public string? FlagCode { get; set; } // örn: "tr", "us" (UI'da bayrak göstermek için)
    public byte[]? IconData { get; set; } // Varbinary storage for flag images
    public string? IconMimeType { get; set; } // image/png, image/svg+xml, etc.
    
    // IAuditable Implementation
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
