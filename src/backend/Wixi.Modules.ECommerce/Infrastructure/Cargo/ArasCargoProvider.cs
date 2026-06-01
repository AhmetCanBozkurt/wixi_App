using Wixi.Modules.ECommerce.Application.Cargo;

namespace Wixi.Modules.ECommerce.Infrastructure.Cargo;

public sealed class ArasCargoProvider : ICargoProvider
{
    public string ProviderName => "Aras Kargo";
    public string ProviderCode => "aras";

    public Task<CargoTrackingResult> TrackAsync(string trackingNumber, CancellationToken ct = default)
    {
        return Task.FromResult(new CargoTrackingResult(false, null, null, null));
    }

    public Task<CargoRateResult> GetRateAsync(CargoRateRequest request, CancellationToken ct = default)
    {
        return Task.FromResult(new CargoRateResult(true, 29.90m, "TRY", null));
    }
}
