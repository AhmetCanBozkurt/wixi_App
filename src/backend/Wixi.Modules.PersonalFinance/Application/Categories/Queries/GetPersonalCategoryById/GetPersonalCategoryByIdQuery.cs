using MediatR;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Queries.GetPersonalCategoryById;

public class GetPersonalCategoryByIdQuery : IRequest<PersonalCategoryDto>
{
    public required Guid CategoryId { get; init; }
    public required Guid UserId { get; init; }
}
