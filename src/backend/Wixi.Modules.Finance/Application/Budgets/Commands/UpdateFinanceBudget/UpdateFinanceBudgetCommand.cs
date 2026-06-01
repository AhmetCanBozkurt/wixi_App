using MediatR;
using Wixi.Modules.Finance.Application.Budgets.Dto;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.UpdateFinanceBudget;

public class UpdateFinanceBudgetCommand : IRequest<FinanceBudgetDto>
{
    public Guid BudgetId { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public UpdateFinanceBudgetDto Dto { get; set; } = null!;
}
