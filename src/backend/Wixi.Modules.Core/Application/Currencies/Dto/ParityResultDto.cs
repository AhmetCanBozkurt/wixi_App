namespace Wixi.Modules.Core.Application.Currencies.Dto;

public class ParityResultDto
{
    public string FromCode { get; set; } = string.Empty;
    public string ToCode { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime RateDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class CrossParityResultDto
{
    public string FromCode { get; set; } = string.Empty;
    public string ToCode { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime RateDate { get; set; }
    public string FormulaBreakdown { get; set; } = string.Empty;
    public decimal? TryPerFrom { get; set; }
    public decimal? TryPerTo { get; set; }
}

public class ConversionResultDto
{
    public decimal Amount { get; set; }
    public string FromCode { get; set; } = string.Empty;
    public string ToCode { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public decimal ConvertedAmount { get; set; }
    public DateTime RateDate { get; set; }
    public string RateField { get; set; } = string.Empty;
}

public class TcmbSyncResultDto
{
    public string Status { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int RatesSaved { get; set; }
    public int CurrenciesCreated { get; set; }
    public string? ErrorMessage { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
