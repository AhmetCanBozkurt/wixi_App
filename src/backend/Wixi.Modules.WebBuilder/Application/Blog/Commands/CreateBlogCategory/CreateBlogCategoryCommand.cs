using MediatR;
using Wixi.Modules.WebBuilder.Application.Blog.Dto;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.CreateBlogCategory;

public record CreateBlogCategoryCommand(
    Guid TenantId,
    string Name,
    string Slug,
    string? Description,
    int SortOrder = 0) : IRequest<BlogCategoryDto>;
