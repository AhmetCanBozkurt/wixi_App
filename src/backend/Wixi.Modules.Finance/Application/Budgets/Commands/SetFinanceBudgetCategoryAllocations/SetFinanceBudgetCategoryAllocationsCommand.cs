using MediatR;
using Wixi.Modules.Finance.Application.Budgets.Dto;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.SetFinanceBudgetCategoryAllocations;

public class SetFinanceBudgetCategoryAllocationsCommand : IRequest<FinanceBudgetDto>
{
    public Guid BudgetId { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public List<BudgetCategoryAllocationDto> Allocations { get; set; } = [];
}
