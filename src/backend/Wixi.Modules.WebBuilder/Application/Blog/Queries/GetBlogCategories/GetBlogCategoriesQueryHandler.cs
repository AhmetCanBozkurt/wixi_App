using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogCategories;

public class GetBlogCategoriesQueryHandler : IRequestHandler<GetBlogCategoriesQuery, List<BlogCategoryDto>>
{
    private readonly WebBuilderDbContext _db;

    public GetBlogCategoriesQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<List<BlogCategoryDto>> Handle(GetBlogCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _db.BlogCategories
            .Where(c => c.TenantId == request.TenantId)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new BlogCategoryDto(c.Id, c.TenantId, c.Name, c.Slug, c.Description, c.SortOrder))
            .ToListAsync(cancellationToken);
    }
}
