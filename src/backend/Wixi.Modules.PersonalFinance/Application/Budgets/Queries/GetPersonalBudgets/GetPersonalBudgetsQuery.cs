using MediatR;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Queries.GetPersonalBudgets;

public class GetPersonalBudgetsQuery : IRequest<PagedResult<PersonalBudgetSummaryDto>>
{
    public required Guid UserId { get; init; }
    public BudgetStatus? Status { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}
