using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Categories.Dto;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Categories.Commands.UpdateFinanceCategory;

public class UpdateFinanceCategoryCommandHandler
    : IRequestHandler<UpdateFinanceCategoryCommand, FinanceCategoryDto>
{
    private readonly WixiFinanceDbContext _db;

    public UpdateFinanceCategoryCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceCategoryDto> Handle(
        UpdateFinanceCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Only user-owned categories can be edited (not system/default)
        var category = await _db.FinanceCategories
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId && c.TenantId == request.TenantId && !c.IsDeleted,
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı veya düzenleme izniniz yok.");

        // Check name uniqueness excluding self
        var nameExists = await _db.FinanceCategories
            .AnyAsync(
                c => c.Id != request.CategoryId &&
                     !c.IsDeleted &&
                     c.Name.ToLower() == dto.Name.ToLower() &&
                     (c.TenantId == request.TenantId || c.IsDefault),
                cancellationToken);

        if (nameExists)
            throw new InvalidOperationException("Bu isimde başka bir kategori zaten mevcut.");

        category.Name = dto.Name;
        if (dto.Type.HasValue) category.Type = dto.Type.Value;
        if (dto.Color is not null) category.Color = dto.Color;
        if (dto.Icon is not null) category.Icon = dto.Icon;

        await _db.SaveChangesAsync(cancellationToken);

        return CategoryDtoMapper.ToDto(category);
    }
}
