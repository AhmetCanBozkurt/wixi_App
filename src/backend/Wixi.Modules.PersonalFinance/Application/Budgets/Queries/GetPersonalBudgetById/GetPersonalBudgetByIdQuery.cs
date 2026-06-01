using MediatR;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Queries.GetPersonalBudgetById;

public class GetPersonalBudgetByIdQuery : IRequest<PersonalBudgetDto>
{
    public required Guid BudgetId { get; init; }
    public required Guid UserId { get; init; }
}
