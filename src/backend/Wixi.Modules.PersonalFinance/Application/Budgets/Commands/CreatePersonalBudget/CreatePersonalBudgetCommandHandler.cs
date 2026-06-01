using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.CreatePersonalBudget;

public class CreatePersonalBudgetCommandHandler
    : IRequestHandler<CreatePersonalBudgetCommand, PersonalBudgetDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public CreatePersonalBudgetCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalBudgetDto> Handle(
        CreatePersonalBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        if (dto.EndDate < dto.StartDate)
            throw new InvalidOperationException("Bitiş tarihi başlangıç tarihinden önce olamaz.");

        var budget = new WixiPersonalBudget
        {
            UserId = request.UserId,
            HouseholdId = dto.HouseholdId,
            Name = dto.Name,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalAmount = dto.TotalAmount,
            PeriodType = dto.PeriodType,
            AutoRenew = dto.AutoRenew,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.PersonalBudgets.Add(budget);

        if (dto.CategoryAllocations is { Count: > 0 })
        {
            foreach (var allocation in dto.CategoryAllocations)
            {
                var category = await _db.PersonalCategories
                    .FirstOrDefaultAsync(
                        c => c.Id == allocation.CategoryId && !c.IsDeleted &&
                             (c.IsDefault || c.UserId == request.UserId),
                        cancellationToken)
                    ?? throw new InvalidOperationException($"Kategori bulunamadı: {allocation.CategoryId}");

                var budgetCategory = new WixiPersonalBudgetCategory
                {
                    BudgetId = budget.Id,
                    CategoryId = allocation.CategoryId,
                    AllocatedAmount = allocation.AllocatedAmount,
                    SpentAmount = 0,
                };

                budgetCategory.Category = category;
                _db.PersonalBudgetCategories.Add(budgetCategory);
                budget.Categories.Add(budgetCategory);
            }
        }

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
