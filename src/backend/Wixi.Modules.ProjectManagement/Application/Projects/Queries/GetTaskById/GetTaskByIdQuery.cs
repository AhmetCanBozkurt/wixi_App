using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Queries.GetTaskById;

public record GetTaskByIdQuery(Guid TaskId) : IRequest<TaskDetailDto?>;

public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, TaskDetailDto?>
{
    private readonly ProjectManagementDbContext _db;

    public GetTaskByIdQueryHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<TaskDetailDto?> Handle(GetTaskByIdQuery request, CancellationToken ct)
    {
        var t = await _db.Tasks
            .AsNoTracking()
            .Include(x => x.Assignees)
            .Include(x => x.Comments.Where(c => !c.IsDeleted))
            .Include(x => x.SubTasks.Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Assignees)
            .FirstOrDefaultAsync(x => x.Id == request.TaskId && !x.IsDeleted, ct);

        if (t == null) return null;

        var timeEntries = await _db.TimeEntries
            .AsNoTracking()
            .Where(e => e.TaskId == t.Id && !e.IsDeleted)
            .OrderByDescending(e => e.StartedAt)
            .Select(e => new TimeEntryDto(
                e.Id, e.TaskId, e.UserId, e.UserName, e.StartedAt, e.EndedAt, e.DurationMinutes, e.Note))
            .ToListAsync(ct);

        // Açık sayaç toplamda o ana kadarki süresiyle sayılır
        var totalMinutes = timeEntries.Sum(e =>
            e.EndedAt != null
                ? e.DurationMinutes
                : Math.Max(0, (int)Math.Round((DateTime.UtcNow - e.StartedAt).TotalMinutes)));

        return new TaskDetailDto(
            t.Id, t.ProjectId, t.ParentTaskId, t.Title, t.Description,
            (int)t.Status, (int)t.Priority, t.Progress,
            t.StartDate, t.DueDate, t.DurationDays, t.SortOrder, t.CompletedAt,
            t.Assignees.Select(a => new TaskAssigneeDto(a.UserId, a.UserName, a.UserEmail)).ToList(),
            t.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new TaskCommentDto(c.Id, c.TaskId, c.AuthorUserId, c.AuthorName, c.Content, c.IsSystemLog, c.CreatedAt))
                .ToList(),
            t.SubTasks
                .OrderBy(s => s.SortOrder)
                .Select(s => new TaskBoardDto(
                    s.Id, s.ProjectId, s.ParentTaskId, s.Title,
                    (int)s.Status, (int)s.Priority, s.Progress,
                    s.StartDate, s.DueDate, s.DurationDays, s.SortOrder, s.CompletedAt,
                    s.Assignees.Select(a => new TaskAssigneeDto(a.UserId, a.UserName, a.UserEmail)).ToList(),
                    0, 0))
                .ToList(),
            timeEntries, totalMinutes,
            t.CreatedAt, t.CreatedByUser);
    }
}
