using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

public class PersonalBudgetDto
{
    public Guid Id { get; set; }
    public Guid? HouseholdId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining => TotalAmount - TotalSpent;
    public BudgetStatus Status { get; set; }
    public BudgetPeriodType PeriodType { get; set; }
    public bool AutoRenew { get; set; }
    public List<PersonalBudgetCategoryDto> Categories { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
