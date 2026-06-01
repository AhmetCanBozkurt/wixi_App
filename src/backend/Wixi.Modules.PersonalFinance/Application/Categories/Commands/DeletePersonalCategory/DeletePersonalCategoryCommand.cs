using MediatR;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Commands.DeletePersonalCategory;

public class DeletePersonalCategoryCommand : IRequest<bool>
{
    public required Guid CategoryId { get; init; }
    public required Guid UserId { get; init; }
}
