namespace Wixi.Modules.ProjectManagement.Application.Projects.Dto;

public record ProjectListDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    int Status,
    Guid? CustomerId,
    Guid? CariId,
    string? CustomerName,
    DateTime StartDate,
    DateTime? EndDate,
    decimal? Budget,
    string? Currency,
    string? Color,
    int TaskCount,
    int DoneTaskCount,
    DateTime CreatedAt);

public record TaskAssigneeDto(
    Guid UserId,
    string? UserName,
    string? UserEmail);

public record TaskBoardDto(
    Guid Id,
    Guid ProjectId,
    Guid? ParentTaskId,
    string Title,
    int Status,
    int Priority,
    int Progress,
    DateTime? StartDate,
    DateTime? DueDate,
    int? DurationDays,
    int SortOrder,
    DateTime? CompletedAt,
    IReadOnlyList<TaskAssigneeDto> Assignees,
    int SubTaskCount,
    int CommentCount);

public record ProjectBoardDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    int Status,
    Guid? CustomerId,
    string? CustomerName,
    DateTime StartDate,
    DateTime? EndDate,
    string? Color,
    IReadOnlyList<TaskBoardDto> Tasks);

public record TaskCommentDto(
    Guid Id,
    Guid TaskId,
    Guid? AuthorUserId,
    string? AuthorName,
    string Content,
    bool IsSystemLog,
    DateTime CreatedAt);

public record TimeEntryDto(
    Guid Id,
    Guid TaskId,
    Guid UserId,
    string? UserName,
    DateTime StartedAt,
    DateTime? EndedAt,
    int DurationMinutes,
    string? Note);

public record TaskDetailDto(
    Guid Id,
    Guid ProjectId,
    Guid? ParentTaskId,
    string Title,
    string? Description,
    int Status,
    int Priority,
    int Progress,
    DateTime? StartDate,
    DateTime? DueDate,
    int? DurationDays,
    int SortOrder,
    DateTime? CompletedAt,
    IReadOnlyList<TaskAssigneeDto> Assignees,
    IReadOnlyList<TaskCommentDto> Comments,
    IReadOnlyList<TaskBoardDto> SubTasks,
    IReadOnlyList<TimeEntryDto> TimeEntries,
    int TotalTrackedMinutes,
    DateTime CreatedAt,
    string? CreatedByUser);
