using Wixi.Modules.Core.Application.TenantPaymentSettings.Dto;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Commands.UpdateTenantPaymentSettings;

namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface ITenantPaymentSettingsRepository
{
    Task<TenantPaymentSettingsDto> GetAsync(Guid tenantId, CancellationToken ct = default);
    Task UpsertAsync(Guid tenantId, UpdateTenantPaymentSettingsCommand command, CancellationToken ct = default);
}
