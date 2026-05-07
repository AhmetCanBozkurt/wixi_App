namespace Wixi.Modules.Core.Application.Common.Interfaces;

public class TcmbDailyRatesDto
{
    public DateTime Date { get; set; }
    public string Status { get; set; } = string.Empty;  // "Success" | "Holiday" | "Error"
    public List<TcmbCurrencyRateDto> Rates { get; set; } = new();
}

public class TcmbCurrencyRateDto
{
    public string Kod { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public int Unit { get; set; } = 1;
    public string Isim { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public int? CrossOrder { get; set; }
    public decimal? ForexBuying { get; set; }
    public decimal? ForexSelling { get; set; }
    public decimal? BanknoteBuying { get; set; }
    public decimal? BanknoteSelling { get; set; }
}

public interface ITcmbExchangeRateService
{
    Task<TcmbDailyRatesDto> FetchAsync(DateTime date, CancellationToken ct = default);
}
