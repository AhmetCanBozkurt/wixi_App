namespace Wixi.Modules.Core.Application.Landing.Dto;

public record PublicCasesDto(
    PublicCaseStudyDto? Featured,
    List<PublicCaseStudyDto> All
);

public record PublicCaseStudyDto(
    Guid Id,
    string ClientSlug,
    string ClientInitials,
    string? ClientLogoUrl,
    string Industry,
    string Metric1Value,
    string Metric1Label,
    string Metric2Value,
    string Metric2Label,
    bool IsFeatured,
    string ClientName,
    string Title,
    string Description,
    string? QuoteText,
    string? QuoteAuthor
);
