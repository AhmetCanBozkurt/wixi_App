using MediatR;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;

namespace Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogPosts;

public record GetBlogPostsQuery(
    Guid TenantId,
    Guid? CategoryId = null,
    bool? IsPublished = null) : IRequest<List<BlogPostListItemDto>>;
