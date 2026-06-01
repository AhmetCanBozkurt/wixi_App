using MediatR;
using Wixi.Modules.Finance.Application.Budgets.Dto;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.CreateFinanceBudget;

public class CreateFinanceBudgetCommand : IRequest<FinanceBudgetDto>
{
    public string TenantId { get; set; } = string.Empty;
    public CreateFinanceBudgetDto Dto { get; set; } = null!;
}
