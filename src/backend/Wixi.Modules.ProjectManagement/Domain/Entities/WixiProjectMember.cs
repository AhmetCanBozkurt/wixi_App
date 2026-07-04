namespace Wixi.Modules.ProjectManagement.Domain.Entities;

/// <summary>
/// Proje üyesi. UserId master DB'deki (Core) kullanıcıya soft referanstır.
/// </summary>
public class WixiProjectMember
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProjectId { get; set; }
    public WixiProject? Project { get; set; }

    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? Role { get; set; }                  // Owner | Member

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
