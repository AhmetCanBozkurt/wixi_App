using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Budgets.Dto;

public class FinanceBudgetSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining { get; set; }
    public FinanceBudgetStatus Status { get; set; }
    public FinanceBudgetPeriodType PeriodType { get; set; }
    public int CategoryCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
