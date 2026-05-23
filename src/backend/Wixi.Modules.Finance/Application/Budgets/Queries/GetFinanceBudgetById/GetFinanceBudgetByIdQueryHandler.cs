using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Queries.GetFinanceBudgetById;

public class GetFinanceBudgetByIdQueryHandler
    : IRequestHandler<GetFinanceBudgetByIdQuery, FinanceBudgetDto>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceBudgetByIdQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceBudgetDto> Handle(
        GetFinanceBudgetByIdQuery request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.FinanceBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.TenantId == request.TenantId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        return BudgetDtoMapper.ToDto(budget);
    }
}
