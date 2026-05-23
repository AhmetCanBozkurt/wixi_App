using MediatR;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTotalByType;

public class GetPersonalTotalByTypeQuery : IRequest<decimal>
{
    public required Guid UserId { get; init; }
    public required PersonalTransactionType Type { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}
