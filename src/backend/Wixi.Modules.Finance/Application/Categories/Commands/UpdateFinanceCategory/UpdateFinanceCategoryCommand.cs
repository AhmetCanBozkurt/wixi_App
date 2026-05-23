using MediatR;
using Wixi.Modules.Finance.Application.Categories.Dto;

namespace Wixi.Modules.Finance.Application.Categories.Commands.UpdateFinanceCategory;

public class UpdateFinanceCategoryCommand : IRequest<FinanceCategoryDto>
{
    public Guid CategoryId { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public UpdateFinanceCategoryDto Dto { get; set; } = null!;
}
