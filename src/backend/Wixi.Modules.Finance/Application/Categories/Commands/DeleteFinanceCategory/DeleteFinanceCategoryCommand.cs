using MediatR;

namespace Wixi.Modules.Finance.Application.Categories.Commands.DeleteFinanceCategory;

public class DeleteFinanceCategoryCommand : IRequest<bool>
{
    public Guid CategoryId { get; set; }
    public string TenantId { get; set; } = string.Empty;
}
