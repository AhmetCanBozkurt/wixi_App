using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Domain.Enums;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Queries.GetPersonalCategories;

public class GetPersonalCategoriesQueryHandler
    : IRequestHandler<GetPersonalCategoriesQuery, List<PersonalCategoryDto>>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalCategoriesQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<List<PersonalCategoryDto>> Handle(
        GetPersonalCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<WixiPersonalCategory> query = _db.PersonalCategories
            .Where(c => !c.IsDeleted && (c.UserId == request.UserId || c.IsDefault));

        if (request.Type.HasValue)
        {
            query = query.Where(c =>
                c.Type == request.Type.Value ||
                c.Type == PersonalCategoryType.Both);
        }

        var items = await query
            .OrderBy(c => c.IsDefault)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return items.Select(ToDto).ToList();
    }

    private static PersonalCategoryDto ToDto(WixiPersonalCategory c) => new()
    {
        Id = c.Id,
        UserId = c.UserId,
        Name = c.Name,
        Type = c.Type,
        Color = c.Color,
        Icon = c.Icon,
        IsDefault = c.IsDefault,
        IsSystem = c.UserId == null,
        CreatedAt = c.CreatedAt,
    };
}
