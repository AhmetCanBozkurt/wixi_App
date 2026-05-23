using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Domain.Enums;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.SetBudgetCategoryAllocations;

public class SetBudgetCategoryAllocationsCommandHandler
    : IRequestHandler<SetBudgetCategoryAllocationsCommand, PersonalBudgetDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public SetBudgetCategoryAllocationsCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalBudgetDto> Handle(
        SetBudgetCategoryAllocationsCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.PersonalBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.UserId == request.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        var requestedCategoryIds = request.Allocations.Select(a => a.CategoryId).ToHashSet();

        foreach (var allocation in request.Allocations)
        {
            var category = await _db.PersonalCategories
                .FirstOrDefaultAsync(
                    c => c.Id == allocation.CategoryId && !c.IsDeleted &&
                         (c.IsDefault || c.UserId == request.UserId),
                    cancellationToken)
                ?? throw new InvalidOperationException($"Kategori bulunamadı: {allocation.CategoryId}");

            var existing = budget.Categories.FirstOrDefault(bc => bc.CategoryId == allocation.CategoryId);

            if (existing is not null)
            {
                existing.AllocatedAmount = allocation.AllocatedAmount;
            }
            else
            {
                var spentAmount = await _db.PersonalTransactions
                    .Where(t => t.BudgetId == request.BudgetId
                             && t.CategoryId == allocation.CategoryId
                             && t.Type == PersonalTransactionType.Expense)
                    .SumAsync(t => t.Amount, cancellationToken);

                var newBudgetCategory = new WixiPersonalBudgetCategory
                {
                    BudgetId = request.BudgetId,
                    CategoryId = allocation.CategoryId,
                    AllocatedAmount = allocation.AllocatedAmount,
                    SpentAmount = spentAmount,
                };
                newBudgetCategory.Category = category;
                _db.PersonalBudgetCategories.Add(newBudgetCategory);
                budget.Categories.Add(newBudgetCategory);
            }
        }

        var toRemove = budget.Categories
            .Where(bc => !requestedCategoryIds.Contains(bc.CategoryId))
            .ToList();

        foreach (var removed in toRemove)
        {
            _db.PersonalBudgetCategories.Remove(removed);
            budget.Categories.Remove(removed);
        }

        budget.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(budget);
    }

    private static PersonalBudgetDto ToDto(WixiPersonalBudget b) => new()
    {
        Id = b.Id,
        HouseholdId = b.HouseholdId,
        Name = b.Name,
        StartDate = b.StartDate,
        EndDate = b.EndDate,
        TotalAmount = b.TotalAmount,
        TotalSpent = b.Categories.Sum(c => c.SpentAmount),
        Status = b.Status,
        PeriodType = b.PeriodType,
        AutoRenew = b.AutoRenew,
        Categories = b.Categories.Select(ToCategoryDto).ToList(),
        CreatedAt = b.CreatedAt,
        UpdatedAt = b.UpdatedAt,
    };

    private static PersonalBudgetCategoryDto ToCategoryDto(WixiPersonalBudgetCategory bc) => new()
    {
        Id = bc.Id,
        CategoryId = bc.CategoryId,
        CategoryName = bc.Category?.Name ?? string.Empty,
        CategoryIcon = bc.Category?.Icon ?? string.Empty,
        CategoryColor = bc.Category?.Color ?? string.Empty,
        AllocatedAmount = bc.AllocatedAmount,
        SpentAmount = bc.SpentAmount,
    };
}
