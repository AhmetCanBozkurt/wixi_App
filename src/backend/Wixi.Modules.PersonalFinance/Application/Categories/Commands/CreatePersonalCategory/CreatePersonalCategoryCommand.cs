using MediatR;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Commands.CreatePersonalCategory;

public class CreatePersonalCategoryCommand : IRequest<PersonalCategoryDto>
{
    public required Guid UserId { get; init; }
    public required CreatePersonalCategoryDto Dto { get; init; }
}
