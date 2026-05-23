using MediatR;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.CreatePersonalBudget;

public class CreatePersonalBudgetCommand : IRequest<PersonalBudgetDto>
{
    public required Guid UserId { get; init; }
    public required CreatePersonalBudgetDto Dto { get; init; }
}
