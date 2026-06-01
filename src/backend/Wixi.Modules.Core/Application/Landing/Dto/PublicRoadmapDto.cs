namespace Wixi.Modules.Core.Application.Landing.Dto;

public record PublicRoadmapDto(
    List<PublicRoadmapPhaseDto> Phases,
    List<PublicChangelogDto> Changelog
);

public record PublicRoadmapPhaseDto(
    string PhaseId,
    string PhaseLabel,
    List<PublicRoadmapItemDto> Items
);

public record PublicRoadmapItemDto(
    Guid Id,
    string Category,
    string PlannedDate,
    int VoteCount,
    bool IsShipped,
    string Title,
    string Description
);

public record PublicChangelogDto(
    Guid Id,
    string Version,
    string ReleaseDate,
    string Tag,
    string Title,
    string Description
);
