using MediatR;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Application.Common;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Budgets.Queries.GetFinanceBudgets;

public class GetFinanceBudgetsQuery : IRequest<PagedResult<FinanceBudgetSummaryDto>>
{
    public string TenantId { get; set; } = string.Empty;
    public FinanceBudgetStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
