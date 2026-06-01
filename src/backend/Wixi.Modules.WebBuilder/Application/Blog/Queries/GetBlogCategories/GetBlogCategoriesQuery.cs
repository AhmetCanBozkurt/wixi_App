using MediatR;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;

namespace Wixi.Modules.WebBuilder.Application.Blog.Queries.GetBlogCategories;

public record GetBlogCategoriesQuery(Guid TenantId) : IRequest<List<BlogCategoryDto>>;
