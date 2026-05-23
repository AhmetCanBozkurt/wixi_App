using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.UpdateBlogCategory;

public record UpdateBlogCategoryCommand(
    Guid CategoryId,
    Guid TenantId,
    string Name,
    string Slug,
    string? Description,
    int SortOrder) : IRequest<Unit>;
