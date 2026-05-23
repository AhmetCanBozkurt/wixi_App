using MediatR;
using Wixi.Modules.Finance.Application.Categories.Dto;

namespace Wixi.Modules.Finance.Application.Categories.Commands.CreateFinanceCategory;

public class CreateFinanceCategoryCommand : IRequest<FinanceCategoryDto>
{
    public string TenantId { get; set; } = string.Empty;
    public CreateFinanceCategoryDto Dto { get; set; } = null!;
}
