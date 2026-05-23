using MediatR;
using Wixi.Modules.Finance.Application.Categories.Dto;

namespace Wixi.Modules.Finance.Application.Categories.Queries.GetFinanceCategoryById;

public class GetFinanceCategoryByIdQuery : IRequest<FinanceCategoryDto>
{
    public Guid CategoryId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
