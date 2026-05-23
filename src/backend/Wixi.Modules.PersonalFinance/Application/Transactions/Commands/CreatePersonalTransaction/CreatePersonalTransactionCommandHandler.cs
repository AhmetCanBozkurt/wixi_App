using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Domain.Enums;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Commands.CreatePersonalTransaction;

public class CreatePersonalTransactionCommandHandler
    : IRequestHandler<CreatePersonalTransactionCommand, PersonalTransactionDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public CreatePersonalTransactionCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalTransactionDto> Handle(
        CreatePersonalTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var category = await _db.PersonalCategories
            .FirstOrDefaultAsync(
                c => c.Id == dto.CategoryId && !c.IsDeleted &&
                     (c.IsDefault || c.UserId == request.UserId),
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        var entity = new WixiPersonalTransaction
        {
            UserId = request.UserId,
            CategoryId = dto.CategoryId,
            BudgetId = dto.BudgetId,
            HouseholdId = dto.HouseholdId,
            Amount = dto.Amount,
            Description = dto.Description,
            Date = dto.Date,
            Type = dto.Type,
            IsInstallment = dto.IsInstallment,
            Tags = dto.Tags is { Count: > 0 }
                ? JsonSerializer.Serialize(dto.Tags)
                : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.PersonalTransactions.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        if (entity.BudgetId.HasValue)
            await RecalculateBudgetCategorySpent(entity.BudgetId.Value, entity.CategoryId, cancellationToken);

        entity.Category = category;
        return ToDto(entity);
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
