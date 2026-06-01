namespace Wixi.Modules.WebBuilder.Application.Forms.Dto;

public record WebFormListItemDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string Slug,
    string? NotifyEmail,
    bool IsActive,
    DateTime CreatedAt);

public record WebFormDto(
    Guid Id,
    Guid TenantId,
    string Name,
    string Slug,
    string? FieldsJson,
    string SubmitButtonText,
    string? SuccessMessage,
    string? NotifyEmail,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record WebFormSubmissionDto(
    Guid Id,
    Guid FormId,
    Guid TenantId,
    string? DataJson,
    string? IpAddress,
    DateTime CreatedAt);

public record PagedResult<T>(List<T> Items, int TotalCount, int Skip, int Take);
