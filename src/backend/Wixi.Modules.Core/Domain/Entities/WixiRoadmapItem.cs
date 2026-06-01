using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiRoadmapItem : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Phase { get; set; } = string.Empty;
    public string PhaseLabel { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string PlannedDate { get; set; } = string.Empty;
    public int VoteCount { get; set; } = 0;
    public bool IsShipped { get; set; } = false;
    public int SortOrder { get; set; }
    public ICollection<WixiRoadmapItemTranslation> Translations { get; set; } = [];
    public ICollection<WixiRoadmapVote> Votes { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
