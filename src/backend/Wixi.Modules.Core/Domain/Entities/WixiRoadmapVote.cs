namespace Wixi.Modules.Core.Domain.Entities;

public class WixiRoadmapVote
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ItemId { get; set; }
    public WixiRoadmapItem Item { get; set; } = null!;
    public string SessionToken { get; set; } = string.Empty;
    public string? IpHash { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
}
