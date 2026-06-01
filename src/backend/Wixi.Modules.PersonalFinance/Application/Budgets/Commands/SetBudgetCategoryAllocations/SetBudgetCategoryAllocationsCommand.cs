using MediatR;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.SetBudgetCategoryAllocations;

public class SetBudgetCategoryAllocationsCommand : IRequest<PersonalBudgetDto>
{
    public required Guid BudgetId { get; init; }
    public required Guid UserId { get; init; }
    public required List<BudgetCategoryAllocationDto> Allocations { get; init; }
}
