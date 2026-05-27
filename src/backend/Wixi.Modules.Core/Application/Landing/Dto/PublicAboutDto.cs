namespace Wixi.Modules.Core.Application.Landing.Dto;

public record PublicAboutDto(
    List<PublicTeamMemberDto> Team,
    List<PublicMilestoneDto> Milestones
);

public record PublicTeamMemberDto(
    Guid Id,
    string FullName,
    string Initials,
    string? AvatarUrl,
    string AvatarColor,
    string Role,
    string Department
);

public record PublicMilestoneDto(
    Guid Id,
    short Year,
    string Title,
    string? Description
);
