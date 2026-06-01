using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Domain.Enums;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Transactions.Commands.DeleteFinanceTransaction;

public class DeleteFinanceTransactionCommandHandler
    : IRequestHandler<DeleteFinanceTransactionCommand, bool>
{
    private readonly WixiFinanceDbContext _db;

    public DeleteFinanceTransactionCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<bool> Handle(
        DeleteFinanceTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var transaction = await _db.FinanceTransactions
            .FirstOrDefaultAsync(
                t => t.Id == request.TransactionId && t.TenantId == request.TenantId,
                cancellationToken);

        if (transaction is null) return false;

        var budgetId = transaction.BudgetId;
        var categoryId = transaction.CategoryId;

        _db.FinanceTransactions.Remove(transaction);
        await _db.SaveChangesAsync(cancellationToken);

        if (budgetId.HasValue)
            await RecalculateBudgetCategorySpent(budgetId.Value, categoryId, cancellationToken);

        return true;
    }

    private async Task RecalculateBudgetCategorySpent(Guid budgetId, Guid categoryId, CancellationToken ct)
    {
        var bc = await _db.FinanceBudgetCategories
            .FirstOrDefaultAsync(x => x.BudgetId == budgetId && x.CategoryId == categoryId, ct);
        if (bc is null) return;
        bc.SpentAmount = await _db.FinanceTransactions
            .Where(t => t.BudgetId == budgetId && t.CategoryId == categoryId && t.Type == FinanceTransactionType.Expense)
            .SumAsync(t => t.Amount, ct);
        await _db.SaveChangesAsync(ct);
    }
}
