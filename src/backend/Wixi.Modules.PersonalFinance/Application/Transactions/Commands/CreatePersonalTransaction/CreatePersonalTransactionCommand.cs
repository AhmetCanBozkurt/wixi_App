using MediatR;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Commands.CreatePersonalTransaction;

public class CreatePersonalTransactionCommand : IRequest<PersonalTransactionDto>
{
    public required CreatePersonalTransactionDto Dto { get; init; }
    public required Guid UserId { get; init; }
}
