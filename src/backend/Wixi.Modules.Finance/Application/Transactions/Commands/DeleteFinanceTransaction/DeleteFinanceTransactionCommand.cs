using MediatR;

namespace Wixi.Modules.Finance.Application.Transactions.Commands.DeleteFinanceTransaction;

public class DeleteFinanceTransactionCommand : IRequest<bool>
{
    public Guid TransactionId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
