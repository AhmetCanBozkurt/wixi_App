using MediatR;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Commands.DeletePersonalTransaction;

public class DeletePersonalTransactionCommand : IRequest<bool>
{
    public required Guid TransactionId { get; init; }
    public required Guid UserId { get; init; }
}
