using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement.Domain.Entities;

public enum ProjectStatus { Active = 0, OnHold = 1, Completed = 2, Cancelled = 3 }

/// <summary>
/// Tenant'ın proje kartı. Müşteri/cari bağı soft-Guid'dir (ECommerce modülündeki
/// WixiCustomer / WixiContact kayıtlarına işaret eder, FK yok — modül sınırı).
/// </summary>
public class WixiProject : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;   // 'PRJ-00001'
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // CRM bağı (M02/M04) — soft referans
    public Guid? CustomerId { get; set; }
    public Guid? CariId { get; set; }
    public string? CustomerName { get; set; }          // denormalize görüntüleme adı

    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }

    public decimal? Budget { get; set; }
    public string? Currency { get; set; }
    public string? Color { get; set; }                 // UI etiket rengi

    public ICollection<WixiProjectTask> Tasks { get; set; } = [];
    public ICollection<WixiProjectMember> Members { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
