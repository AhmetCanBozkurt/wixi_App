using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTotalByType;

public class GetFinanceTotalByTypeQueryHandler
    : IRequestHandler<GetFinanceTotalByTypeQuery, decimal>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceTotalByTypeQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<decimal> Handle(
        GetFinanceTotalByTypeQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.FinanceTransactions
            .Where(t => t.TenantId == request.TenantId && t.Type == request.Type);

        if (request.From.HasValue)
            query = query.Where(t => t.Date >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(t => t.Date <= request.To.Value);

        return await query.SumAsync(t => t.Amount, cancellationToken);
    }
}
