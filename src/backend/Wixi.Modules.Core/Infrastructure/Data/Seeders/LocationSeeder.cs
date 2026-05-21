using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data.Seeders;

public static class LocationSeeder
{
    private const string BaseUrl = "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public static async Task SeedAsync(WixiCoreDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (await db.Countries.IgnoreQueryFilters().AnyAsync(ct))
        {
            logger.LogInformation("[LocationSeeder] Zaten seed edilmiş, atlanıyor.");
            return;
        }

        using var http = new HttpClient { Timeout = TimeSpan.FromMinutes(10) };

        logger.LogInformation("[LocationSeeder] Ülkeler yükleniyor...");
        await SeedCountriesAsync(db, http, logger, ct);

        logger.LogInformation("[LocationSeeder] Eyaletler yükleniyor...");
        await SeedStatesAsync(db, http, logger, ct);

        logger.LogInformation("[LocationSeeder] Şehirler yükleniyor...");
        await SeedCitiesAsync(db, http, logger, ct);

        logger.LogInformation("[LocationSeeder] Tüm coğrafi veriler başarıyla yüklendi.");
    }

    private static async Task SeedCountriesAsync(WixiCoreDbContext db, HttpClient http, ILogger logger, CancellationToken ct)
    {
        await using var stream = await http.GetStreamAsync(BaseUrl + "countries.json", ct);
        var sources = await JsonSerializer.DeserializeAsync<List<CountrySource>>(stream, JsonOpts, ct)
                      ?? [];

        var entities = sources.Select(s => new WixiCountry
        {
            Id = s.Id,
            Name = s.Name,
            Iso2 = s.Iso2,
            Iso3 = s.Iso3,
            PhoneCode = Truncate(s.PhoneCode, 20),
            Capital = Truncate(s.Capital, 150),
            Currency = Truncate(s.Currency, 10),
            CurrencyName = Truncate(s.CurrencyName, 100),
            CurrencySymbol = Truncate(s.CurrencySymbol, 10),
            Region = Truncate(s.Region, 100),
            SubRegion = Truncate(s.SubRegion, 100),
            Latitude = ParseDecimal(s.Latitude),
            Longitude = ParseDecimal(s.Longitude),
            Flag = Truncate(s.Emoji, 10),
            IsActive = true
        }).ToList();

        await db.Countries.AddRangeAsync(entities, ct);
        await db.RawSaveAsync(ct);
        logger.LogInformation("[LocationSeeder] {Count} ülke eklendi.", entities.Count);
    }

    private static async Task SeedStatesAsync(WixiCoreDbContext db, HttpClient http, ILogger logger, CancellationToken ct)
    {
        await using var stream = await http.GetStreamAsync(BaseUrl + "states.json", ct);
        var sources = await JsonSerializer.DeserializeAsync<List<StateSource>>(stream, JsonOpts, ct)
                      ?? [];

        // Geçerli country ID seti (FK hatası olmaması için)
        var validCountryIds = (await db.Countries.IgnoreQueryFilters()
                                                 .Select(c => c.Id)
                                                 .ToListAsync(ct)).ToHashSet();

        var entities = sources
            .Where(s => validCountryIds.Contains(s.CountryId))
            .Select(s => new WixiState
            {
                Id = s.Id,
                CountryId = s.CountryId,
                Name = Truncate(s.Name, 150)!,
                StateCode = Truncate(s.StateCode, 10),
                CountryCode = Truncate(s.CountryCode, 2),
                Latitude = ParseDecimal(s.Latitude),
                Longitude = ParseDecimal(s.Longitude),
                IsActive = true
            }).ToList();

        await InsertInBatchesAsync(db, db.States, entities, 500, logger, ct);
        logger.LogInformation("[LocationSeeder] {Count} eyalet eklendi.", entities.Count);
    }

    private static async Task SeedCitiesAsync(WixiCoreDbContext db, HttpClient http, ILogger logger, CancellationToken ct)
    {
        await using var stream = await http.GetStreamAsync(BaseUrl + "cities.json", ct);
        var sources = await JsonSerializer.DeserializeAsync<List<CitySource>>(stream, JsonOpts, ct)
                      ?? [];

        var validStateIds = (await db.States.IgnoreQueryFilters()
                                            .Select(s => s.Id)
                                            .ToListAsync(ct)).ToHashSet();

        var validCountryIds = (await db.Countries.IgnoreQueryFilters()
                                                  .Select(c => c.Id)
                                                  .ToListAsync(ct)).ToHashSet();

        var entities = sources
            .Where(s => validStateIds.Contains(s.StateId) && validCountryIds.Contains(s.CountryId))
            .Select(s => new WixiCity
            {
                Id = s.Id,
                StateId = s.StateId,
                CountryId = s.CountryId,
                Name = Truncate(s.Name, 150)!,
                Latitude = ParseDecimal(s.Latitude),
                Longitude = ParseDecimal(s.Longitude),
                IsActive = true
            }).ToList();

        await InsertInBatchesAsync(db, db.Cities, entities, 1000, logger, ct);
        logger.LogInformation("[LocationSeeder] {Count} şehir eklendi.", entities.Count);
    }

    private static async Task InsertInBatchesAsync<T>(
        WixiCoreDbContext db,
        DbSet<T> set,
        List<T> entities,
        int batchSize,
        ILogger logger,
        CancellationToken ct) where T : class
    {
        var total = entities.Count;
        for (var i = 0; i < total; i += batchSize)
        {
            var batch = entities.GetRange(i, Math.Min(batchSize, total - i));
            await set.AddRangeAsync(batch, ct);
            await db.RawSaveAsync(ct);
            logger.LogDebug("[LocationSeeder] {Done}/{Total} kayıt eklendi.", Math.Min(i + batchSize, total), total);
        }
    }

    private static decimal? ParseDecimal(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return decimal.TryParse(value, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var result)
            ? result
            : null;
    }

    private static string? Truncate(string? value, int maxLen)
        => value is null ? null : value.Length <= maxLen ? value : value[..maxLen];

    // ── Kaynak DTO'lar ─────────────────────────────────────────────

    private sealed record CountrySource(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("iso2")] string Iso2,
        [property: JsonPropertyName("iso3")] string Iso3,
        [property: JsonPropertyName("phonecode")] string? PhoneCode,
        [property: JsonPropertyName("capital")] string? Capital,
        [property: JsonPropertyName("currency")] string? Currency,
        [property: JsonPropertyName("currency_name")] string? CurrencyName,
        [property: JsonPropertyName("currency_symbol")] string? CurrencySymbol,
        [property: JsonPropertyName("region")] string? Region,
        [property: JsonPropertyName("subregion")] string? SubRegion,
        [property: JsonPropertyName("latitude")] string? Latitude,
        [property: JsonPropertyName("longitude")] string? Longitude,
        [property: JsonPropertyName("emoji")] string? Emoji
    );

    private sealed record StateSource(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("country_id")] int CountryId,
        [property: JsonPropertyName("country_code")] string? CountryCode,
        [property: JsonPropertyName("state_code")] string? StateCode,
        [property: JsonPropertyName("latitude")] string? Latitude,
        [property: JsonPropertyName("longitude")] string? Longitude
    );

    private sealed record CitySource(
        [property: JsonPropertyName("id")] int Id,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("state_id")] int StateId,
        [property: JsonPropertyName("country_id")] int CountryId,
        [property: JsonPropertyName("latitude")] string? Latitude,
        [property: JsonPropertyName("longitude")] string? Longitude
    );
}
