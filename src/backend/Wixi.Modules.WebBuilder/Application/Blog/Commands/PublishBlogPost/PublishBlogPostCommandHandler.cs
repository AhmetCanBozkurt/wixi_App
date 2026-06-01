using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.PublishBlogPost;

public class PublishBlogPostCommandHandler : IRequestHandler<PublishBlogPostCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public PublishBlogPostCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(PublishBlogPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts
            .FirstOrDefaultAsync(p => p.Id == request.PostId && p.TenantId == request.TenantId, cancellationToken);

        if (post is null)
            throw new KeyNotFoundException($"Blog yazısı bulunamadı: {request.PostId}");

        post.IsPublished = request.IsPublished;

        if (request.IsPublished && post.PublishedAt is null)
            post.PublishedAt = DateTime.UtcNow;
        else if (!request.IsPublished)
            post.PublishedAt = null;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
