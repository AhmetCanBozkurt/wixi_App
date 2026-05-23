using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.CreateBlogCategory;

public class CreateBlogCategoryCommandHandler : IRequestHandler<CreateBlogCategoryCommand, BlogCategoryDto>
{
    private readonly WebBuilderDbContext _db;

    public CreateBlogCategoryCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<BlogCategoryDto> Handle(CreateBlogCategoryCommand request, CancellationToken cancellationToken)
    {
        var slugExists = await _db.BlogCategories
            .AnyAsync(c => c.TenantId == request.TenantId && c.Slug == request.Slug, cancellationToken);

        if (slugExists)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı zaten kullanımda.");

        var category = new WixiBlogCategory
        {
            TenantId = request.TenantId,
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            SortOrder = request.SortOrder
        };

        _db.BlogCategories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);

        return new BlogCategoryDto(category.Id, category.TenantId, category.Name, category.Slug, category.Description, category.SortOrder);
    }
}
