using MediatR;
using Wixi.Modules.Finance.Application.Common;
using Wixi.Modules.Finance.Application.Transactions.Dto;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTransactions;

public class GetFinanceTransactionsQuery : IRequest<PagedResult<FinanceTransactionDto>>
{
    public string TenantId { get; set; } = string.Empty;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public FinanceTransactionType? Type { get; set; }
    public Guid? CategoryId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? Search { get; set; }
}
