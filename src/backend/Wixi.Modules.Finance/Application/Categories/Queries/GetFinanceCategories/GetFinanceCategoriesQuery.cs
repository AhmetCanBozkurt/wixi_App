using MediatR;
using Wixi.Modules.Finance.Application.Categories.Dto;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Categories.Queries.GetFinanceCategories;

public class GetFinanceCategoriesQuery : IRequest<List<FinanceCategoryDto>>
{
    public string TenantId { get; set; } = string.Empty;
    public FinanceCategoryType? Type { get; set; }
}
