using Wixi.Shared.Configuration;

namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IPaymentSettingsProvider
{
    // Global platform key'leri (super admin ayarları)
    Task<StripeOptions> GetStripeOptionsAsync(CancellationToken ct = default);
    Task<IyzipayOptions> GetIyzipayOptionsAsync(CancellationToken ct = default);

    // Tenant-specific key'ler (DB'de yoksa platform ayarlarına düşer)
    Task<IyzipayOptions> GetIyzipayOptionsForTenantAsync(Guid tenantId, CancellationToken ct = default);
    Task<StripeOptions> GetStripeOptionsForTenantAsync(Guid tenantId, CancellationToken ct = default);
}
