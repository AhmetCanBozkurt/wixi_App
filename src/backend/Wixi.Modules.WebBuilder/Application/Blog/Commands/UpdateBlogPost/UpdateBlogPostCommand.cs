using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.UpdateBlogPost;

public record UpdateBlogPostCommand(
    Guid PostId,
    Guid TenantId,
    Guid? CategoryId,
    string Title,
    string Slug,
    string? Summary,
    string? ContentHtml,
    string? FeaturedImageUrl,
    string? MetaTitle,
    string? MetaDescription,
    string? Tags,
    string? AuthorName,
    int ReadTimeMinutes) : IRequest<Unit>;
