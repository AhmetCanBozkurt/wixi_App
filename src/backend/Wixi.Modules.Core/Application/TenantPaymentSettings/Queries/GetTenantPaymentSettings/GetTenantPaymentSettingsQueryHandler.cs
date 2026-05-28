using MediatR;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Application.TenantPaymentSettings.Dto;

namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Queries.GetTenantPaymentSettings;

public class GetTenantPaymentSettingsQueryHandler
    : IRequestHandler<GetTenantPaymentSettingsQuery, TenantPaymentSettingsDto>
{
    private readonly ITenantPaymentSettingsRepository _repo;

    public GetTenantPaymentSettingsQueryHandler(ITenantPaymentSettingsRepository repo)
    {
        _repo = repo;
    }

    public Task<TenantPaymentSettingsDto> Handle(
        GetTenantPaymentSettingsQuery request, CancellationToken ct)
        => _repo.GetAsync(request.TenantId, ct);
}
