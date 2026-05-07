using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiCurrency : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Code { get; set; } = string.Empty;    // "USD", "EUR", "TRY"
    public string Name { get; set; } = string.Empty;    // "ABD Doları"
    public string NameEn { get; set; } = string.Empty;  // "US Dollar"
    public string Symbol { get; set; } = string.Empty;  // "$"
    public int Unit { get; set; } = 1;
    public bool IsBase { get; set; } = false;
    public bool IsTcmbTracked { get; set; } = false;
    public int SortOrder { get; set; } = 0;

    public ICollection<WixiExchangeRate> ExchangeRates { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
