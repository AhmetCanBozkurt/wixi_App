using MediatR;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.DeleteFinanceBudget;

public class DeleteFinanceBudgetCommand : IRequest<bool>
{
    public Guid BudgetId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
