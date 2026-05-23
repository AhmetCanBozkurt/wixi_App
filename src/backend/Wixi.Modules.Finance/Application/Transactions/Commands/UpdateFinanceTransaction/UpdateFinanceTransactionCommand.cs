using MediatR;
using Wixi.Modules.Finance.Application.Transactions.Dto;

namespace Wixi.Modules.Finance.Application.Transactions.Commands.UpdateFinanceTransaction;

public class UpdateFinanceTransactionCommand : IRequest<FinanceTransactionDto>
{
    public Guid TransactionId { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public UpdateFinanceTransactionDto Dto { get; set; } = null!;
}
