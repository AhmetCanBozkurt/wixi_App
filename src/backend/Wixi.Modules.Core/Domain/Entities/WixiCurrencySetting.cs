using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCurrencySetting : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string BaseCurrencyCode { get; set; } = "TRY";
    public bool TcmbAutoSyncEnabled { get; set; } = true;
    public DateTime? LastSyncedAt { get; set; }
    public string? LastSyncStatus { get; set; }

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
