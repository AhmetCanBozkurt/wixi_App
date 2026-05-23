using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Categories.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Commands.CreatePersonalCategory;

public class CreatePersonalCategoryCommandHandler
    : IRequestHandler<CreatePersonalCategoryCommand, PersonalCategoryDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public CreatePersonalCategoryCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalCategoryDto> Handle(
        CreatePersonalCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var nameExists = await _db.PersonalCategories
            .AnyAsync(
                c => !c.IsDeleted &&
                     c.Name.ToLower() == dto.Name.ToLower() &&
                     (c.UserId == request.UserId || c.IsDefault),
                cancellationToken);

        if (nameExists)
            throw new InvalidOperationException("Bu isimde bir kategori zaten mevcut.");

        var category = new WixiPersonalCategory
        {
            UserId = request.UserId,
            Name = dto.Name,
            Type = dto.Type,
            Color = dto.Color,
            Icon = dto.Icon,
            IsDefault = false,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
        };

        _db.PersonalCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(category);
    }

    internal static PersonalCategoryDto ToDto(WixiPersonalCategory c) => new()
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
