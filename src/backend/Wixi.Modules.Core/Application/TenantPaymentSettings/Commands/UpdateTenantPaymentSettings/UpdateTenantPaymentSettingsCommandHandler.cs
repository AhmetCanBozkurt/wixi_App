using MediatR;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Application.TenantPaymentSettings.Commands.UpdateTenantPaymentSettings;

public class UpdateTenantPaymentSettingsCommandHandler
    : IRequestHandler<UpdateTenantPaymentSettingsCommand, Unit>
{
    private readonly ITenantPaymentSettingsRepository _repo;

    public UpdateTenantPaymentSettingsCommandHandler(ITenantPaymentSettingsRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(
        UpdateTenantPaymentSettingsCommand request, CancellationToken ct)
    {
        await _repo.UpsertAsync(request.TenantId, request, ct);
        return Unit.Value;
    }
}
