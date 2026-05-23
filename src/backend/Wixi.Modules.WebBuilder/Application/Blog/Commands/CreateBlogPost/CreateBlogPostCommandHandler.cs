using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.CreateBlogPost;

public class CreateBlogPostCommandHandler : IRequestHandler<CreateBlogPostCommand, BlogPostDto>
{
    private readonly WebBuilderDbContext _db;

    public CreateBlogPostCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<BlogPostDto> Handle(CreateBlogPostCommand request, CancellationToken cancellationToken)
    {
        var slugExists = await _db.BlogPosts
            .AnyAsync(p => p.TenantId == request.TenantId && p.Slug == request.Slug, cancellationToken);

        if (slugExists)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı zaten kullanımda.");

        var post = new WixiBlogPost
        {
            TenantId = request.TenantId,
            CategoryId = request.CategoryId,
            Title = request.Title,
            Slug = request.Slug,
            Summary = request.Summary,
            ContentHtml = request.ContentHtml,
            FeaturedImageUrl = request.FeaturedImageUrl,
            MetaTitle = request.MetaTitle,
            MetaDescription = request.MetaDescription,
            Tags = request.Tags,
            AuthorName = request.AuthorName,
            ReadTimeMinutes = request.ReadTimeMinutes
        };

        _db.BlogPosts.Add(post);
        await _db.SaveChangesAsync(cancellationToken);

        return new BlogPostDto(
            post.Id, post.TenantId, post.CategoryId, post.Title, post.Slug,
            post.Summary, post.FeaturedImageUrl, post.IsPublished, post.PublishedAt,
            post.AuthorName, post.ReadTimeMinutes, post.CreatedAt,
            post.ContentHtml, post.MetaTitle, post.MetaDescription, post.Tags);
    }
}
