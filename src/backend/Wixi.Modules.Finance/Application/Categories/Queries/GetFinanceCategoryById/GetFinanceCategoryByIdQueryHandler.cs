using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Categories.Dto;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Categories.Queries.GetFinanceCategoryById;

public class GetFinanceCategoryByIdQueryHandler
    : IRequestHandler<GetFinanceCategoryByIdQuery, FinanceCategoryDto>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceCategoryByIdQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceCategoryDto> Handle(
        GetFinanceCategoryByIdQuery request,
        CancellationToken cancellationToken)
    {
        var category = await _db.FinanceCategories
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId && !c.IsDeleted &&
                     (c.TenantId == request.TenantId || c.IsDefault),
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        return CategoryDtoMapper.ToDto(category);
    }
}
