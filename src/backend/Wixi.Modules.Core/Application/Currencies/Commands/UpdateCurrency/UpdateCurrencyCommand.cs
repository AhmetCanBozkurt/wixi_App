using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Commands.UpdateCurrency;

public record UpdateCurrencyCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Symbol,
    int Unit,
    bool IsTcmbTracked,
    bool IsActive,
    int SortOrder
) : IRequest<bool>;

public class UpdateCurrencyCommandHandler : IRequestHandler<UpdateCurrencyCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateCurrencyCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateCurrencyCommand request, CancellationToken cancellationToken)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == request.Id && !c.IsDeleted, cancellationToken);

        if (currency == null) return false;

        var duplicateCode = await _context.Currencies
            .AnyAsync(c => c.Code == request.Code.ToUpperInvariant() && c.Id != request.Id && !c.IsDeleted, cancellationToken);

        if (duplicateCode)
        {
            throw new InvalidOperationException($"Currency with code '{request.Code}' already exists.");
        }

        currency.Code = request.Code.ToUpperInvariant();
        currency.Name = request.Name;
        currency.NameEn = request.NameEn;
        currency.Symbol = request.Symbol;
        currency.Unit = request.Unit > 0 ? request.Unit : 1;
        currency.IsTcmbTracked = request.IsTcmbTracked;
        currency.IsActive = request.IsActive;
        currency.SortOrder = request.SortOrder;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
