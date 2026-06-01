using MediatR;
using Wixi.Modules.Finance.Application.Transactions.Dto;

namespace Wixi.Modules.Finance.Application.Transactions.Commands.CreateFinanceTransaction;

public class CreateFinanceTransactionCommand : IRequest<FinanceTransactionDto>
{
    public string TenantId { get; set; } = string.Empty;
    public CreateFinanceTransactionDto Dto { get; set; } = null!;
}
