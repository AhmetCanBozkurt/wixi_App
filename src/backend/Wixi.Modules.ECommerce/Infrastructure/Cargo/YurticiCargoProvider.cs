using Wixi.Modules.ECommerce.Application.Cargo;

namespace Wixi.Modules.ECommerce.Infrastructure.Cargo;

public sealed class YurticiCargoProvider : ICargoProvider
{
    public string ProviderName => "Yurtiçi Kargo";
    public string ProviderCode => "yurtici";

    public Task<CargoTrackingResult> TrackAsync(string trackingNumber, CancellationToken ct = default)
    {
        return Task.FromResult(new CargoTrackingResult(false, null, null, null));
    }

    public Task<CargoRateResult> GetRateAsync(CargoRateRequest request, CancellationToken ct = default)
    {
        return Task.FromResult(new CargoRateResult(true, 27.50m, "TRY", null));
    }
}
