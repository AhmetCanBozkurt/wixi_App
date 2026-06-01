using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.DeleteBlogPost;

public record DeleteBlogPostCommand(Guid PostId, Guid TenantId) : IRequest<Unit>;
