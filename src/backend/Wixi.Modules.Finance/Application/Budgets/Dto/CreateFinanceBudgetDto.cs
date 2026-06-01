using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Budgets.Dto;

public class CreateFinanceBudgetDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "TotalAmount must be greater than zero.")]
    public decimal TotalAmount { get; set; }

    public FinanceBudgetPeriodType PeriodType { get; set; } = FinanceBudgetPeriodType.Monthly;
    public bool AutoRenew { get; set; } = false;

    public List<BudgetCategoryAllocationDto>? CategoryAllocations { get; set; }
}
