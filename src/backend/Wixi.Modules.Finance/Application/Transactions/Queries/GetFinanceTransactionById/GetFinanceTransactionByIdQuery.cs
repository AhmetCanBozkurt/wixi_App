using MediatR;
using Wixi.Modules.Finance.Application.Transactions.Dto;

namespace Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTransactionById;

public class GetFinanceTransactionByIdQuery : IRequest<FinanceTransactionDto>
{
    public Guid TransactionId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
