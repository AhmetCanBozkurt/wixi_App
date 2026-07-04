using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement.Domain.Entities;

/// <summary>
/// Görev yorumu. IsSystemLog=true satırlar aktivite logudur
/// (durum değişimi, atama vb. otomatik kayıtlar).
/// </summary>
public class WixiTaskComment : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaskId { get; set; }
    public WixiProjectTask? Task { get; set; }

    public Guid? AuthorUserId { get; set; }
    public string? AuthorName { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsSystemLog { get; set; } = false;

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
