using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.PublishBlogPost;

public record PublishBlogPostCommand(Guid PostId, Guid TenantId, bool IsPublished) : IRequest<Unit>;
