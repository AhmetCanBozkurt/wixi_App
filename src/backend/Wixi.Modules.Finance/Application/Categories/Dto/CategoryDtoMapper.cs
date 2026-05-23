using Wixi.Modules.Finance.Domain.Entities;

namespace Wixi.Modules.Finance.Application.Categories.Dto;

/// <summary>Shared mapping helpers for Category-related DTOs.</summary>
internal static class CategoryDtoMapper
{
    internal static FinanceCategoryDto ToDto(WixiFinanceCategory c) => new()
    {
        Id = c.Id,
        TenantId = c.TenantId,
        Name = c.Name,
        Type = c.Type,
        Color = c.Color,
        Icon = c.Icon,
        IsDefault = c.IsDefault,
        CreatedAt = c.CreatedAt,
    };
}
