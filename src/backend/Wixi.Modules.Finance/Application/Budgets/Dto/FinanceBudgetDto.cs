using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Budgets.Dto;

public class FinanceBudgetDto
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining => TotalAmount - TotalSpent;
    public FinanceBudgetStatus Status { get; set; }
    public FinanceBudgetPeriodType PeriodType { get; set; }
    public bool AutoRenew { get; set; }
    public List<FinanceBudgetCategoryDto> Categories { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
