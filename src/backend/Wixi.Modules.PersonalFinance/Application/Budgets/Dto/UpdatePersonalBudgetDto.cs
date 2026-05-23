using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

public class UpdatePersonalBudgetDto
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public BudgetStatus? Status { get; set; }
    public BudgetPeriodType? PeriodType { get; set; }
    public bool? AutoRenew { get; set; }
}
