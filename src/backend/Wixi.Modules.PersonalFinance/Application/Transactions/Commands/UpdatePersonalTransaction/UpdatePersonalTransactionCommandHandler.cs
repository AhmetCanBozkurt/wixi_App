using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Domain.Enums;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Commands.UpdatePersonalTransaction;

public class UpdatePersonalTransactionCommandHandler
    : IRequestHandler<UpdatePersonalTransactionCommand, PersonalTransactionDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public UpdatePersonalTransactionCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalTransactionDto> Handle(
        UpdatePersonalTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var transaction = await _db.PersonalTransactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(
                t => t.Id == request.TransactionId && t.UserId == request.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException("İşlem bulunamadı.");

        var dto = request.Dto;

        var oldBudgetId = transaction.BudgetId;
        var oldCategoryId = transaction.CategoryId;

        var category = await _db.PersonalCategories
            .FirstOrDefaultAsync(
                c => c.Id == dto.CategoryId && !c.IsDeleted &&
                     (c.IsDefault || c.UserId == request.UserId),
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        transaction.CategoryId = dto.CategoryId;
        transaction.BudgetId = dto.BudgetId;
        transaction.Amount = dto.Amount;
        transaction.Description = dto.Description;
        transaction.Date = dto.Date;
        transaction.Type = dto.Type;
        transaction.Tags = dto.Tags is { Count: > 0 }
            ? JsonSerializer.Serialize(dto.Tags)
            : null;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        if (oldBudgetId.HasValue)
            await RecalculateBudgetCategorySpent(oldBudgetId.Value, oldCategoryId, cancellationToken);

        if (transaction.BudgetId.HasValue &&
            !(transaction.BudgetId == oldBudgetId && transaction.CategoryId == oldCategoryId))
        {
            await RecalculateBudgetCategorySpent(transaction.BudgetId.Value, transaction.CategoryId, cancellationToken);
        }

        transaction.Category = category;
        return ToDto(transaction);
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

    private static PersonalTransactionDto ToDto(WixiPersonalTransaction t) => new()
    {
        Id = t.Id,
        CategoryId = t.CategoryId,
        CategoryName = t.Category?.Name ?? string.Empty,
        CategoryIcon = t.Category?.Icon ?? string.Empty,
        CategoryColor = t.Category?.Color ?? string.Empty,
        BudgetId = t.BudgetId,
        HouseholdId = t.HouseholdId,
        Amount = t.Amount,
        Description = t.Description,
        Date = t.Date,
        Type = t.Type,
        Tags = t.Tags != null
            ? JsonSerializer.Deserialize<List<string>>(t.Tags)
            : null,
        IsInstallment = t.IsInstallment,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
    };
}
