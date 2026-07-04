using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement.Domain.Entities;

/// <summary>
/// Görev eki. D-02: dosya relativePath ile saklanır, tam URL yasak.
/// </summary>
public class WixiTaskAttachment : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaskId { get; set; }
    public WixiProjectTask? Task { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string RelativePath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string? ContentType { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
