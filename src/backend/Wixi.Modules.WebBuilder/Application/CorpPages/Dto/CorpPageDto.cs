namespace Wixi.Modules.WebBuilder.Application.CorpPages.Dto;

public record CorpPageDto(
    Guid Id,
    Guid TenantId,
    string PageType,
    string Slug,
    string Title,
    string? LayoutConfigJson,
    string? ThemeOverrideJson,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string? OpenGraphImageUrl,
    string? BacklinksJson,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record CorpPageListItemDto(
    Guid Id,
    string Slug,
    string Title,
    string PageType,
    bool IsPublished,
    DateTime? PublishedAt,
    DateTime? UpdatedAt);
