using MediatR;
using Wixi.Modules.Finance.Application.Budgets.Dto;

namespace Wixi.Modules.Finance.Application.Budgets.Queries.GetFinanceBudgetById;

public class GetFinanceBudgetByIdQuery : IRequest<FinanceBudgetDto>
{
    public Guid BudgetId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
