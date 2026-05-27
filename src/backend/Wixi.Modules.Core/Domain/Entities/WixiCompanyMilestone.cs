using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCompanyMilestone : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public short Year { get; set; }
    public int SortOrder { get; set; }
    public ICollection<WixiCompanyMilestoneTranslation> Translations { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
