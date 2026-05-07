using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Currencies.Dto;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Queries.GetCurrencySettings;

public record GetCurrencySettingsQuery : IRequest<CurrencySettingsDto?>;

public class GetCurrencySettingsQueryHandler : IRequestHandler<GetCurrencySettingsQuery, CurrencySettingsDto?>
{
    private readonly WixiCoreDbContext _context;

    public GetCurrencySettingsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<CurrencySettingsDto?> Handle(GetCurrencySettingsQuery request, CancellationToken cancellationToken)
    {
        var setting = await _context.CurrencySettings.FirstOrDefaultAsync(cancellationToken);

        if (setting == null) return null;

        return new CurrencySettingsDto
        {
            Id = setting.Id,
            BaseCurrencyCode = setting.BaseCurrencyCode,
            TcmbAutoSyncEnabled = setting.TcmbAutoSyncEnabled,
            LastSyncedAt = setting.LastSyncedAt,
            LastSyncStatus = setting.LastSyncStatus
        };
    }
}
