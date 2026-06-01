using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Budgets.Dto;

public class UpdateFinanceBudgetDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public FinanceBudgetStatus? Status { get; set; }
    public FinanceBudgetPeriodType? PeriodType { get; set; }
    public bool? AutoRenew { get; set; }
}
