using MediatR;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;

namespace Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogPostBySlug;

public record GetBlogPostBySlugQuery(Guid TenantId, string Slug) : IRequest<BlogPostDto?>;
