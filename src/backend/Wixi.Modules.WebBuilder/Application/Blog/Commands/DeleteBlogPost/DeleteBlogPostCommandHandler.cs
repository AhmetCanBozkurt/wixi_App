using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.DeleteBlogPost;

public class DeleteBlogPostCommandHandler : IRequestHandler<DeleteBlogPostCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public DeleteBlogPostCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteBlogPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _db.BlogPosts
            .FirstOrDefaultAsync(p => p.Id == request.PostId && p.TenantId == request.TenantId, cancellationToken);

        if (post is null)
            throw new KeyNotFoundException($"Blog yazısı bulunamadı: {request.PostId}");

        post.IsDeleted = true;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
