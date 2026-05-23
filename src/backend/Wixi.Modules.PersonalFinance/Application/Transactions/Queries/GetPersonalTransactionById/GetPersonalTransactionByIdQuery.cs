using MediatR;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactionById;

public class GetPersonalTransactionByIdQuery : IRequest<PersonalTransactionDto>
{
    public required Guid TransactionId { get; init; }
    public required Guid UserId { get; init; }
}
