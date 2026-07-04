using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement.Domain.Entities;

/// <summary>
/// Görev bazlı zaman kaydı. EndedAt=null → sayaç çalışıyor demektir;
/// bir kullanıcının aynı anda tek açık kaydı olabilir (uygulama kuralı).
/// </summary>
public class WixiTimeEntry : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaskId { get; set; }
    public WixiProjectTask? Task { get; set; }

    public Guid UserId { get; set; }
    public string? UserName { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
    public int DurationMinutes { get; set; } = 0;
    public string? Note { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
