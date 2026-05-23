using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Domain.Enums;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Commands.DeletePersonalTransaction;

public class DeletePersonalTransactionCommandHandler
    : IRequestHandler<DeletePersonalTransactionCommand, bool>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public DeletePersonalTransactionCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<bool> Handle(
        DeletePersonalTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var transaction = await _db.PersonalTransactions
            .FirstOrDefaultAsync(
                t => t.Id == request.TransactionId && t.UserId == request.UserId,
                cancellationToken);

        if (transaction is null) return false;

        var budgetId = transaction.BudgetId;
        var categoryId = transaction.CategoryId;

        _db.PersonalTransactions.Remove(transaction);
        await _db.SaveChangesAsync(cancellationToken);

        if (budgetId.HasValue)
            await RecalculateBudgetCategorySpent(budgetId.Value, categoryId, cancellationToken);

        return true;
    }

    private async Task RecalculateBudgetCategorySpent(Guid budgetId, Guid categoryId, CancellationToken ct)
    {
        var budgetCategory = await _db.PersonalBudgetCategories
            .FirstOrDefaultAsync(bc => bc.BudgetId == budgetId && bc.CategoryId == categoryId, ct);

        if (budgetCategory is null) return;

        budgetCategory.SpentAmount = await _db.PersonalTransactions
            .Where(t => t.BudgetId == budgetId
                     && t.CategoryId == categoryId
                     && t.Type == PersonalTransactionType.Expense)
            .SumAsync(t => t.Amount, ct);

        await _db.SaveChangesAsync(ct);
    }
}
