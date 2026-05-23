using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTotalByType;

public class GetPersonalTotalByTypeQueryHandler
    : IRequestHandler<GetPersonalTotalByTypeQuery, decimal>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalTotalByTypeQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<decimal> Handle(
        GetPersonalTotalByTypeQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.PersonalTransactions
            .Where(t => t.UserId == request.UserId && t.Type == request.Type);

        if (request.From.HasValue)
            query = query.Where(t => t.Date >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(t => t.Date <= request.To.Value);

        return await query.SumAsync(t => t.Amount, cancellationToken);
    }
}
