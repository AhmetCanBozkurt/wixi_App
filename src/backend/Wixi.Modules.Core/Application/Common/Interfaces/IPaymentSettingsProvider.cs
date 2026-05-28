using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IPaymentSettingsProvider
{
    Task<StripeOptions> GetStripeOptionsAsync(CancellationToken ct = default);
    Task<IyzipayOptions> GetIyzipayOptionsAsync(CancellationToken ct = default);
}
