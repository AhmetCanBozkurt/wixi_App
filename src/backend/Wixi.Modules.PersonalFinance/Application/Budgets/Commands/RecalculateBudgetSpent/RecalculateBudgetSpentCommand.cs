using MediatR;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.RecalculateBudgetSpent;

public class RecalculateBudgetSpentCommand : IRequest<Unit>
{
    public required Guid BudgetId { get; init; }
    public required Guid UserId { get; init; }
}
