using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Commands.DeleteCurrency;

public record DeleteCurrencyCommand(Guid Id) : IRequest<bool>;

public class DeleteCurrencyCommandHandler : IRequestHandler<DeleteCurrencyCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public DeleteCurrencyCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteCurrencyCommand request, CancellationToken cancellationToken)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == request.Id && !c.IsDeleted, cancellationToken);

        if (currency == null) return false;

        if (currency.IsBase)
        {
            throw new InvalidOperationException("Base currency cannot be deleted. Set another currency as base first.");
        }

        currency.IsDeleted = true;
        currency.IsActive = false;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
