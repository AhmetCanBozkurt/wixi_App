using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

public class PersonalBudgetSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining { get; set; }
    public BudgetStatus Status { get; set; }
    public BudgetPeriodType PeriodType { get; set; }
    public bool AutoRenew { get; set; }
    public int CategoryCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
