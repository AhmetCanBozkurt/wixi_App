using MediatR;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactions;

public class GetPersonalTransactionsQuery : IRequest<PagedResult<PersonalTransactionDto>>
{
    public required Guid UserId { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public PersonalTransactionType? Type { get; init; }
    public Guid? CategoryId { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
    public string? Search { get; init; }
}
