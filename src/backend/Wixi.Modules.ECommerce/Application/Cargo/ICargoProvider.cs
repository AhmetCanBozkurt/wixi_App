namespace Wixi.Modules.ECommerce.Application.Cargo;

public record CargoTrackingResult(bool Found, string? Status, string? LastLocation, DateTime? LastUpdate);

public record CargoRateRequest(string FromCity, string ToCity, decimal WeightKg, bool IsDesi);

public record CargoRateResult(bool Success, decimal? Price, string? Currency, string? Error);

public interface ICargoProvider
{
    string ProviderName { get; }
    string ProviderCode { get; }
    Task<CargoTrackingResult> TrackAsync(string trackingNumber, CancellationToken ct = default);
    Task<CargoRateResult> GetRateAsync(CargoRateRequest request, CancellationToken ct = default);
}
