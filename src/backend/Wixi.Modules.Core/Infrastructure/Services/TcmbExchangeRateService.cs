using System.Globalization;
using System.Net;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class TcmbExchangeRateService : ITcmbExchangeRateService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TcmbExchangeRateService> _logger;

    public TcmbExchangeRateService(HttpClient httpClient, ILogger<TcmbExchangeRateService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<TcmbDailyRatesDto> FetchAsync(DateTime date, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var url = date.Date == today
            ? "kurlar/today.xml"
            : $"kurlar/{date:yyyyMM}/{date:ddMMyyyy}.xml";

        _logger.LogInformation("Fetching TCMB rates from {Url}", url);

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync(url, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "HTTP request to TCMB failed");
            throw;
        }

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogInformation("TCMB returned 404 for {Date} — likely a holiday", date.Date);
            return new TcmbDailyRatesDto { Date = date.Date, Status = "Holiday", Rates = new() };
        }

        response.EnsureSuccessStatusCode();

        var xml = await response.Content.ReadAsStringAsync(ct);
        return ParseXml(xml, date.Date);
    }

    private TcmbDailyRatesDto ParseXml(string xml, DateTime date)
    {
        var doc = XDocument.Parse(xml);
        var rates = new List<TcmbCurrencyRateDto>();

        foreach (var currency in doc.Descendants("Currency"))
        {
            var code = currency.Attribute("Kod")?.Value ?? string.Empty;
            var currencyCode = currency.Attribute("CurrencyCode")?.Value ?? string.Empty;

            var unitStr = currency.Element("Unit")?.Value ?? "1";
            int.TryParse(unitStr, out var unit);
            if (unit <= 0) unit = 1;

            var isim = currency.Element("Isim")?.Value ?? string.Empty;
            var currencyName = currency.Element("CurrencyName")?.Value ?? string.Empty;

            int? crossOrder = null;
            var crossOrderStr = currency.Element("CrossOrder")?.Value;
            if (!string.IsNullOrEmpty(crossOrderStr) && int.TryParse(crossOrderStr, out var co))
            {
                crossOrder = co;
            }

            rates.Add(new TcmbCurrencyRateDto
            {
                Kod = code,
                CurrencyCode = currencyCode,
                Unit = unit,
                Isim = isim,
                CurrencyName = currencyName,
                CrossOrder = crossOrder,
                ForexBuying = ParseDecimal(currency.Element("ForexBuying")?.Value),
                ForexSelling = ParseDecimal(currency.Element("ForexSelling")?.Value),
                BanknoteBuying = ParseDecimal(currency.Element("BanknoteBuying")?.Value),
                BanknoteSelling = ParseDecimal(currency.Element("BanknoteSelling")?.Value)
            });
        }

        return new TcmbDailyRatesDto
        {
            Date = date,
            Status = "Success",
            Rates = rates
        };
    }

    private static decimal? ParseDecimal(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (decimal.TryParse(value, NumberStyles.Number, CultureInfo.InvariantCulture, out var result))
        {
            return result;
        }
        return null;
    }
}
