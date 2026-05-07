using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.Core.Domain.Entities;

public class WixiExchangeRate : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CurrencyId { get; set; }
    public WixiCurrency Currency { get; set; } = null!;
    public string CurrencyCode { get; set; } = string.Empty;
    public int Unit { get; set; } = 1;
    public int? CrossOrder { get; set; }
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
    public DateTime RateDate { get; set; }
    public string Source { get; set; } = "TCMB";

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
