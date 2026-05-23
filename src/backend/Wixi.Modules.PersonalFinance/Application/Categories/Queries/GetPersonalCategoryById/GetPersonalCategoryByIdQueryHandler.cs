using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Queries.GetPersonalCategoryById;

public class GetPersonalCategoryByIdQueryHandler
    : IRequestHandler<GetPersonalCategoryByIdQuery, PersonalCategoryDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalCategoryByIdQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalCategoryDto> Handle(
        GetPersonalCategoryByIdQuery request,
        CancellationToken cancellationToken)
    {
        var category = await _db.PersonalCategories
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId &&
                     !c.IsDeleted &&
                     (c.UserId == request.UserId || c.IsDefault),
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        return new PersonalCategoryDto
        {
            Id = category.Id,
            UserId = category.UserId,
            Name = category.Name,
            Type = category.Type,
            Color = category.Color,
            Icon = category.Icon,
            IsDefault = category.IsDefault,
            IsSystem = category.UserId == null,
            CreatedAt = category.CreatedAt,
        };
    }
}
