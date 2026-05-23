using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Domain.Enums;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.RecalculateFinanceBudgetSpent;

public class RecalculateFinanceBudgetSpentCommandHandler
    : IRequestHandler<RecalculateFinanceBudgetSpentCommand, Unit>
{
    private readonly WixiFinanceDbContext _db;

    public RecalculateFinanceBudgetSpentCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<Unit> Handle(
        RecalculateFinanceBudgetSpentCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.FinanceBudgets
            .Include(b => b.Categories)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.TenantId == request.TenantId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        foreach (var budgetCategory in budget.Categories)
        {
            budgetCategory.SpentAmount = await _db.FinanceTransactions
                .Where(t => t.BudgetId == request.BudgetId
                         && t.CategoryId == budgetCategory.CategoryId
                         && t.Type == FinanceTransactionType.Expense)
                .SumAsync(t => t.Amount, cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);

        if (budget.Status == FinanceBudgetStatus.Active && budget.EndDate < DateTime.UtcNow)
        {
            budget.Status = FinanceBudgetStatus.Completed;
            await _db.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
