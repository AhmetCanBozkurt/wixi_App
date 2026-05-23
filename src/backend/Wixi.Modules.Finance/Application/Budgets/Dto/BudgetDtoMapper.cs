using Wixi.Modules.Finance.Domain.Entities;

namespace Wixi.Modules.Finance.Application.Budgets.Dto;

/// <summary>Shared mapping helpers for Budget-related DTOs.</summary>
internal static class BudgetDtoMapper
{
    internal static FinanceBudgetDto ToDto(WixiFinanceBudget b) => new()
    {
        Id = b.Id,
        TenantId = b.TenantId,
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

    internal static FinanceBudgetCategoryDto ToCategoryDto(WixiFinanceBudgetCategory bc) => new()
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
