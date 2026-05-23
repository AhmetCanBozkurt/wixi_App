using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogPostBySlug;

public class GetBlogPostBySlugQueryHandler : IRequestHandler<GetBlogPostBySlugQuery, BlogPostDto?>
{
    private readonly WebBuilderDbContext _db;

    public GetBlogPostBySlugQueryHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<BlogPostDto?> Handle(GetBlogPostBySlugQuery request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts
            .FirstOrDefaultAsync(p => p.TenantId == request.TenantId && p.Slug == request.Slug, cancellationToken);

        if (post is null) return null;

        return new BlogPostDto(
            post.Id, post.TenantId, post.CategoryId, post.Title, post.Slug,
            post.Summary, post.FeaturedImageUrl, post.IsPublished, post.PublishedAt,
            post.AuthorName, post.ReadTimeMinutes, post.CreatedAt,
            post.ContentHtml, post.MetaTitle, post.MetaDescription, post.Tags);
    }
}
