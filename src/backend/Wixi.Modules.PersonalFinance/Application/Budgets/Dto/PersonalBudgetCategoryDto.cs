namespace Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

public class PersonalBudgetCategoryDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal AllocatedAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public decimal RemainingAmount => AllocatedAmount - SpentAmount;
    public decimal SpentPercentage => AllocatedAmount == 0 ? 0 : SpentAmount / AllocatedAmount * 100;
}
