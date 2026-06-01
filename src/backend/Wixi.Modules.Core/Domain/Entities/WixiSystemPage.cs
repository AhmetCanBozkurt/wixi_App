using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiSystemPage : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Path { get; set; } = string.Empty;     // "/admin/definitions/regions"
    public string Name { get; set; } = string.Empty;     // "Bölge Yönetimi"
    public string? Group { get; set; }                   // "Tanımlamalar", "Sistem", vb.
    public string? Icon { get; set; }                    // "FaMap" (opsiyonel)
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsDeleted { get; set; } = false;
}
