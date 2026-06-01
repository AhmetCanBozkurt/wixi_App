using MediatR;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Commands.UpdatePersonalCategory;

public class UpdatePersonalCategoryCommand : IRequest<PersonalCategoryDto>
{
    public required Guid CategoryId { get; init; }
    public required Guid UserId { get; init; }
    public required UpdatePersonalCategoryDto Dto { get; init; }
}
