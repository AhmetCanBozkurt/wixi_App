using MediatR;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.CreateBlogPost;

public record CreateBlogPostCommand(
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
    int ReadTimeMinutes = 0) : IRequest<BlogPostDto>;
