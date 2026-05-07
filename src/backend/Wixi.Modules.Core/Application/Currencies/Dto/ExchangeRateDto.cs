using Wixi.Shared.Application.Dto;

namespace Wixi.Modules.Core.Application.Currencies.Dto;

public class ExchangeRateDto : AuditableDto
{
    public Guid Id { get; set; }
    public DateTime RateDate { get; set; }
    public Guid CurrencyId { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public int? CrossOrder { get; set; }
    public int Unit { get; set; }
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
    public string Source { get; set; } = "TCMB";
}
