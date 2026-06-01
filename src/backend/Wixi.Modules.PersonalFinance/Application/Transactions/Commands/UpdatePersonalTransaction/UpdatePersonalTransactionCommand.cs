using MediatR;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Commands.UpdatePersonalTransaction;

public class UpdatePersonalTransactionCommand : IRequest<PersonalTransactionDto>
{
    public required Guid TransactionId { get; init; }
    public required UpdatePersonalTransactionDto Dto { get; init; }
    public required Guid UserId { get; init; }
}
