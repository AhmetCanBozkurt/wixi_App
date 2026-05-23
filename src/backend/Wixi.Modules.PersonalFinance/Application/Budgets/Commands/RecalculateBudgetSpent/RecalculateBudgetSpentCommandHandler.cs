using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Domain.Enums;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.RecalculateBudgetSpent;

public class RecalculateBudgetSpentCommandHandler
    : IRequestHandler<RecalculateBudgetSpentCommand, Unit>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public RecalculateBudgetSpentCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<Unit> Handle(
        RecalculateBudgetSpentCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.PersonalBudgets
            .Include(b => b.Categories)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.UserId == request.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        foreach (var budgetCategory in budget.Categories)
        {
            budgetCategory.SpentAmount = await _db.PersonalTransactions
                .Where(t => t.BudgetId == request.BudgetId
                         && t.CategoryId == budgetCategory.CategoryId
                         && t.Type == PersonalTransactionType.Expense)
                .SumAsync(t => t.Amount, cancellationToken);
        }

        await _db.SaveChangesAsync(cancellationToken);

        UpdateBudgetStatusByDate(budget);

        if (budget.Status == BudgetStatus.Completed)
            await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }

    private static void UpdateBudgetStatusByDate(Domain.Entities.WixiPersonalBudget budget)
    {
        if (budget.Status == BudgetStatus.Active && budget.EndDate < DateTime.UtcNow)
            budget.Status = BudgetStatus.Completed;
    }
}
