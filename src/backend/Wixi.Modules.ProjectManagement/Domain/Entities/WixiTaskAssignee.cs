namespace Wixi.Modules.ProjectManagement.Domain.Entities;

/// <summary>
/// Göreve atanan kullanıcı. Kullanıcılar master DB'de (Core) yaşadığından
/// UserId soft-Guid'dir; ad/e-posta görüntüleme için denormalize tutulur.
/// </summary>
public class WixiTaskAssignee
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaskId { get; set; }
    public WixiProjectTask? Task { get; set; }

    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
