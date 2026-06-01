namespace Wixi.Modules.WebBuilder.Application.Blog.Dto;

public record BlogCategoryDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string Slug,
    string? Description,
    int SortOrder);

public record BlogPostListItemDto(
    Guid Id,
    Guid TenantId,
    Guid? CategoryId,
    string Title,
    string Slug,
    string? Summary,
    string? FeaturedImageUrl,
    bool IsPublished,
    DateTime? PublishedAt,
    string? AuthorName,
    int ReadTimeMinutes,
    DateTime CreatedAt);

public record BlogPostDto(
    Guid Id,
    Guid TenantId,
    Guid? CategoryId,
    string Title,
    string Slug,
    string? Summary,
    string? FeaturedImageUrl,
    bool IsPublished,
    DateTime? PublishedAt,
    string? AuthorName,
    int ReadTimeMinutes,
    DateTime CreatedAt,
    string? ContentHtml,
    string? MetaTitle,
    string? MetaDescription,
    string? Tags);
