using MediatR;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactionsByDateRange;

public class GetPersonalTransactionsByDateRangeQuery : IRequest<List<PersonalTransactionDto>>
{
    public required Guid UserId { get; init; }
    public required DateTime From { get; init; }
    public required DateTime To { get; init; }
}
