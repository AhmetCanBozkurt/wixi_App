using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.DeleteFinanceBudget;

public class DeleteFinanceBudgetCommandHandler
    : IRequestHandler<DeleteFinanceBudgetCommand, bool>
{
    private readonly WixiFinanceDbContext _db;

    public DeleteFinanceBudgetCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<bool> Handle(
        DeleteFinanceBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.FinanceBudgets
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.TenantId == request.TenantId,
                cancellationToken);

        if (budget is null) return false;

        _db.FinanceBudgets.Remove(budget);
        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }
}
