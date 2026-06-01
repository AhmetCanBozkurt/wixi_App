using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

public class CreatePersonalBudgetDto
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public Guid? HouseholdId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required, Range(0.01, double.MaxValue)]
    public decimal TotalAmount { get; set; }

    public BudgetPeriodType PeriodType { get; set; } = BudgetPeriodType.Monthly;
    public bool AutoRenew { get; set; } = false;

    public List<BudgetCategoryAllocationDto>? CategoryAllocations { get; set; }
}
