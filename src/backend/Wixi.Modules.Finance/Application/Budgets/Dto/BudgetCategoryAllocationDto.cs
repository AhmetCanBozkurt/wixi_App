using System.ComponentModel.DataAnnotations;

namespace Wixi.Modules.Finance.Application.Budgets.Dto;

public class BudgetCategoryAllocationDto
{
    [Required]
    public Guid CategoryId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal AllocatedAmount { get; set; }
}
