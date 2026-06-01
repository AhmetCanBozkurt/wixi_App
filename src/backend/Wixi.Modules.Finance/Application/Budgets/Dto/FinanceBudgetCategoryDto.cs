namespace Wixi.Modules.Finance.Application.Budgets.Dto;

public class FinanceBudgetCategoryDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal AllocatedAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount => AllocatedAmount - SpentAmount;
    public decimal SpentPercentage => AllocatedAmount == 0
        ? 0
        : Math.Round(SpentAmount / AllocatedAmount * 100, 1);
}
