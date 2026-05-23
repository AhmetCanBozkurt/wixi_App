using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Categories.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Domain.Enums;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Categories.Queries.GetFinanceCategories;

public class GetFinanceCategoriesQueryHandler
    : IRequestHandler<GetFinanceCategoriesQuery, List<FinanceCategoryDto>>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceCategoriesQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<List<FinanceCategoryDto>> Handle(
        GetFinanceCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<WixiFinanceCategory> query = _db.FinanceCategories
            .Where(c => !c.IsDeleted && (c.TenantId == request.TenantId || c.IsDefault));

        if (request.Type.HasValue)
        {
            query = query.Where(c =>
                c.Type == request.Type.Value ||
                c.Type == FinanceCategoryType.Both);
        }

        var items = await query
            .OrderBy(c => c.IsDefault)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return items.Select(CategoryDtoMapper.ToDto).ToList();
    }
}
