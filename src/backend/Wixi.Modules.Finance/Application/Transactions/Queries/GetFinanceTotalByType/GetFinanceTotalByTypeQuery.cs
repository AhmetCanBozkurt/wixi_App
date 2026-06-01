using MediatR;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTotalByType;

public class GetFinanceTotalByTypeQuery : IRequest<decimal>
{
    public string TenantId { get; set; } = string.Empty;
    public FinanceTransactionType Type { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}
