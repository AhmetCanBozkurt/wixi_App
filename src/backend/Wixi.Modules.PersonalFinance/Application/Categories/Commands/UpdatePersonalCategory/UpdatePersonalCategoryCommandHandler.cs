using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Commands.UpdatePersonalCategory;

public class UpdatePersonalCategoryCommandHandler
    : IRequestHandler<UpdatePersonalCategoryCommand, PersonalCategoryDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public UpdatePersonalCategoryCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalCategoryDto> Handle(
        UpdatePersonalCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _db.PersonalCategories
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId &&
                     c.UserId == request.UserId &&
                     !c.IsDeleted,
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        var dto = request.Dto;

        if (!string.Equals(category.Name, dto.Name, StringComparison.OrdinalIgnoreCase))
        {
            var nameExists = await _db.PersonalCategories
                .AnyAsync(
                    c => !c.IsDeleted &&
                         c.Id != request.CategoryId &&
                         c.Name.ToLower() == dto.Name.ToLower() &&
                         (c.UserId == request.UserId || c.IsDefault),
                    cancellationToken);

            if (nameExists)
                throw new InvalidOperationException("Bu isimde bir kategori zaten mevcut.");
        }

        category.Name = dto.Name;

        if (dto.Type.HasValue)
            category.Type = dto.Type.Value;

        if (dto.Color is not null)
            category.Color = dto.Color;

        if (dto.Icon is not null)
            category.Icon = dto.Icon;

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(category);
    }

    private static PersonalCategoryDto ToDto(Domain.Entities.WixiPersonalCategory c) => new()
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
