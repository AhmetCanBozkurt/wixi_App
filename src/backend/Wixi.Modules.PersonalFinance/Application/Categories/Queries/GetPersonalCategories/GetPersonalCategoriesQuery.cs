using MediatR;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Queries.GetPersonalCategories;

public class GetPersonalCategoriesQuery : IRequest<List<PersonalCategoryDto>>
{
    public required Guid UserId { get; init; }
    public PersonalCategoryType? Type { get; init; }
}
