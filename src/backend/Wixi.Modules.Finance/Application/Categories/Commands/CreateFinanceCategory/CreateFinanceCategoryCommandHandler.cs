using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Categories.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Categories.Commands.CreateFinanceCategory;

public class CreateFinanceCategoryCommandHandler
    : IRequestHandler<CreateFinanceCategoryCommand, FinanceCategoryDto>
{
    private readonly WixiFinanceDbContext _db;

    public CreateFinanceCategoryCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceCategoryDto> Handle(
        CreateFinanceCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var nameExists = await _db.FinanceCategories
            .AnyAsync(
                c => !c.IsDeleted &&
                     c.Name.ToLower() == dto.Name.ToLower() &&
                     (c.TenantId == request.TenantId || c.IsDefault),
                cancellationToken);

        if (nameExists)
            throw new InvalidOperationException("Bu isimde bir kategori zaten mevcut.");

        var category = new WixiFinanceCategory
        {
            TenantId = request.TenantId,
            Name = dto.Name,
            Type = dto.Type,
            Color = dto.Color,
            Icon = dto.Icon,
            IsDefault = false,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
        };

        _db.FinanceCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return CategoryDtoMapper.ToDto(category);
    }
}
