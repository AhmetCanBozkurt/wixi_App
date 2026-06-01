using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.UpdateBlogPost;

public class UpdateBlogPostCommandHandler : IRequestHandler<UpdateBlogPostCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public UpdateBlogPostCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateBlogPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts
            .FirstOrDefaultAsync(p => p.Id == request.PostId && p.TenantId == request.TenantId, cancellationToken);

        if (post is null)
            throw new KeyNotFoundException($"Blog yazısı bulunamadı: {request.PostId}");

        var slugConflict = await _db.BlogPosts
            .AnyAsync(p => p.TenantId == request.TenantId && p.Slug == request.Slug && p.Id != request.PostId, cancellationToken);

        if (slugConflict)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı başka bir yazıda kullanımda.");

        post.CategoryId = request.CategoryId;
        post.Title = request.Title;
        post.Slug = request.Slug;
        post.Summary = request.Summary;
        post.ContentHtml = request.ContentHtml;
        post.FeaturedImageUrl = request.FeaturedImageUrl;
        post.MetaTitle = request.MetaTitle;
        post.MetaDescription = request.MetaDescription;
        post.Tags = request.Tags;
        post.AuthorName = request.AuthorName;
        post.ReadTimeMinutes = request.ReadTimeMinutes;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
