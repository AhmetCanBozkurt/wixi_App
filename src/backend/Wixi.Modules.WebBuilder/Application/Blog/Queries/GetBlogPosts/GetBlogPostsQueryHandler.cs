using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogPosts;

public class GetBlogPostsQueryHandler : IRequestHandler<GetBlogPostsQuery, List<BlogPostListItemDto>>
{
    private readonly WebBuilderDbContext _db;

    public GetBlogPostsQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<List<BlogPostListItemDto>> Handle(GetBlogPostsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.BlogPosts.Where(p => p.TenantId == request.TenantId);

        if (request.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == request.CategoryId.Value);

        if (request.IsPublished.HasValue)
            query = query.Where(p => p.IsPublished == request.IsPublished.Value);

        return await query
            .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Select(p => new BlogPostListItemDto(
                p.Id, p.TenantId, p.CategoryId, p.Title, p.Slug,
                p.Summary, p.FeaturedImageUrl, p.IsPublished, p.PublishedAt,
                p.AuthorName, p.ReadTimeMinutes, p.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
