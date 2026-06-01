using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.Finance.Application.Transactions.Dto;
using Wixi.Modules.Finance.Domain.Enums;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Transactions.Commands.UpdateFinanceTransaction;

public class UpdateFinanceTransactionCommandHandler
    : IRequestHandler<UpdateFinanceTransactionCommand, FinanceTransactionDto>
{
    private readonly WixiFinanceDbContext _db;

    public UpdateFinanceTransactionCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceTransactionDto> Handle(
        UpdateFinanceTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var transaction = await _db.FinanceTransactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(
                t => t.Id == request.TransactionId && t.TenantId == request.TenantId,
                cancellationToken)
            ?? throw new InvalidOperationException("İşlem bulunamadı.");

        var oldBudgetId = transaction.BudgetId;
        var oldCategoryId = transaction.CategoryId;

        var category = await _db.FinanceCategories
            .FirstOrDefaultAsync(
                c => c.Id == dto.CategoryId && !c.IsDeleted &&
                     (c.IsDefault || c.TenantId == request.TenantId),
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        transaction.CategoryId = dto.CategoryId;
        transaction.BudgetId = dto.BudgetId;
        transaction.Amount = dto.Amount;
        transaction.Description = dto.Description;
        transaction.Date = dto.Date;
        transaction.Type = dto.Type;
        transaction.Tags = dto.Tags is { Count: > 0 } ? JsonSerializer.Serialize(dto.Tags) : null;
        transaction.UpdatedAt = DateTime.UtcNow;
        transaction.Category = category;

        await _db.SaveChangesAsync(cancellationToken);

        // Recalculate for old budget/category
        if (oldBudgetId.HasValue)
            await RecalculateBudgetCategorySpent(oldBudgetId.Value, oldCategoryId, cancellationToken);

        // Recalculate for new budget/category if different
        if (transaction.BudgetId.HasValue &&
            (transaction.BudgetId != oldBudgetId || transaction.CategoryId != oldCategoryId))
        {
            await RecalculateBudgetCategorySpent(transaction.BudgetId.Value, transaction.CategoryId, cancellationToken);
        }

        return ToDto(transaction);
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

    private static FinanceTransactionDto ToDto(Domain.Entities.WixiFinanceTransaction t) => new()
    {
        Id = t.Id,
        TenantId = t.TenantId,
        CategoryId = t.CategoryId,
        CategoryName = t.Category?.Name ?? string.Empty,
        CategoryIcon = t.Category?.Icon ?? string.Empty,
        CategoryColor = t.Category?.Color ?? string.Empty,
        BudgetId = t.BudgetId,
        Amount = t.Amount,
        Description = t.Description,
        Date = t.Date,
        Type = t.Type,
        Tags = t.Tags != null ? JsonSerializer.Deserialize<List<string>>(t.Tags) : null,
        IsInstallment = t.IsInstallment,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
    };
}
