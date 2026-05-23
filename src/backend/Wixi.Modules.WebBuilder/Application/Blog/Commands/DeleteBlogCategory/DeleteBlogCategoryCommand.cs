using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.DeleteBlogCategory;

public record DeleteBlogCategoryCommand(Guid CategoryId, Guid TenantId) : IRequest<Unit>;
