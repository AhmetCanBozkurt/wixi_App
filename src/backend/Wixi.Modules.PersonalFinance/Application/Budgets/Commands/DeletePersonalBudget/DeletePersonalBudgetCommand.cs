using MediatR;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.DeletePersonalBudget;

public class DeletePersonalBudgetCommand : IRequest<bool>
{
    public required Guid BudgetId { get; init; }
    public required Guid UserId { get; init; }
}
