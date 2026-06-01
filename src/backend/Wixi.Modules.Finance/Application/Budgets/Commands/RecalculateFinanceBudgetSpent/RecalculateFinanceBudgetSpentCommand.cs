using MediatR;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.RecalculateFinanceBudgetSpent;

public class RecalculateFinanceBudgetSpentCommand : IRequest<Unit>
{
    public Guid BudgetId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
