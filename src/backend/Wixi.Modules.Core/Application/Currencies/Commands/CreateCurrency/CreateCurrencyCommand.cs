using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Currencies.Commands.CreateCurrency;

public record CreateCurrencyCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Symbol,
    int Unit,
    bool IsTcmbTracked,
    int SortOrder
) : IRequest<Guid>;

public class CreateCurrencyCommandHandler : IRequestHandler<CreateCurrencyCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateCurrencyCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCurrencyCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Currencies
            .AnyAsync(c => c.Code == request.Code.ToUpperInvariant() && !c.IsDeleted, cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException($"Currency with code '{request.Code}' already exists.");
        }

        var currency = new WixiCurrency
        {
            Code = request.Code.ToUpperInvariant(),
            Name = request.Name,
            NameEn = request.NameEn ?? string.Empty,
            Symbol = request.Symbol ?? string.Empty,
            Unit = request.Unit > 0 ? request.Unit : 1,
            IsTcmbTracked = request.IsTcmbTracked,
            SortOrder = request.SortOrder
        };

        _context.Currencies.Add(currency);
        await _context.SaveChangesAsync(cancellationToken);
        return currency.Id;
    }
}
