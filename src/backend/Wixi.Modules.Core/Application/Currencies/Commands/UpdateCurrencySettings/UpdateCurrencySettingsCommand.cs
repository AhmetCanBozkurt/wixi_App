using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Commands.UpdateCurrencySettings;

public record UpdateCurrencySettingsCommand(
    string BaseCurrencyCode,
    bool TcmbAutoSyncEnabled
) : IRequest<bool>;

public class UpdateCurrencySettingsCommandHandler : IRequestHandler<UpdateCurrencySettingsCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateCurrencySettingsCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateCurrencySettingsCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.CurrencySettings.FirstOrDefaultAsync(cancellationToken);

        if (setting == null) return false;

        // FIX-6: Validate BaseCurrencyCode references a real currency
        var normalizedCode = request.BaseCurrencyCode.ToUpperInvariant();
        var currencyExists = await _context.Currencies
            .AnyAsync(c => c.Code == normalizedCode && !c.IsDeleted, cancellationToken);

        if (!currencyExists)
            throw new InvalidOperationException($"'{normalizedCode}' kodlu para birimi bulunamadı.");

        setting.BaseCurrencyCode = normalizedCode;
        setting.TcmbAutoSyncEnabled = request.TcmbAutoSyncEnabled;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
