using MediatR;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.UpdatePersonalBudget;

public class UpdatePersonalBudgetCommand : IRequest<PersonalBudgetDto>
{
    public required Guid BudgetId { get; init; }
    public required Guid UserId { get; init; }
    public required UpdatePersonalBudgetDto Dto { get; init; }
}
