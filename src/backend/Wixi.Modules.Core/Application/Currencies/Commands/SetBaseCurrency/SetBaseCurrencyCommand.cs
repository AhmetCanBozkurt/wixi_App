using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Commands.SetBaseCurrency;

public record SetBaseCurrencyCommand(Guid Id) : IRequest<bool>;

public class SetBaseCurrencyCommandHandler : IRequestHandler<SetBaseCurrencyCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public SetBaseCurrencyCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(SetBaseCurrencyCommand request, CancellationToken cancellationToken)
    {
        // FIX-4: Open transaction BEFORE reading to prevent race condition
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var target = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == request.Id && !c.IsDeleted, cancellationToken);

        if (target == null)
        {
            await transaction.RollbackAsync(cancellationToken);
            return false;
        }

        var allCurrencies = await _context.Currencies
            .Where(c => !c.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var currency in allCurrencies)
        {
            currency.IsBase = false;
        }

        target.IsBase = true;

        var setting = await _context.CurrencySettings.FirstOrDefaultAsync(cancellationToken);
        if (setting != null)
        {
            setting.BaseCurrencyCode = target.Code;
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return true;
    }
}
