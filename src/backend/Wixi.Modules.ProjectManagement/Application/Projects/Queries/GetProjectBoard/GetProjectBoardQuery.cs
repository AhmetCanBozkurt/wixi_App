using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Queries.GetProjectBoard;

public record GetProjectBoardQuery(Guid ProjectId) : IRequest<ProjectBoardDto?>;

public class GetProjectBoardQueryHandler : IRequestHandler<GetProjectBoardQuery, ProjectBoardDto?>
{
    private readonly ProjectManagementDbContext _db;

    public GetProjectBoardQueryHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<ProjectBoardDto?> Handle(GetProjectBoardQuery request, CancellationToken ct)
    {
        var p = await _db.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.ProjectId && !x.IsDeleted, ct);

        if (p == null) return null;

        // Kanban + Gantt tek istekte: tüm görevler (alt görevler dahil) + atamalar
        var tasks = await _db.Tasks
            .AsNoTracking()
            .Where(t => t.ProjectId == p.Id && !t.IsDeleted)
            .OrderBy(t => t.Status).ThenBy(t => t.SortOrder)
            .Select(t => new TaskBoardDto(
                t.Id, t.ProjectId, t.ParentTaskId, t.Title,
                (int)t.Status, (int)t.Priority, t.Progress,
                t.StartDate, t.DueDate, t.DurationDays, t.SortOrder, t.CompletedAt,
                t.Assignees.Select(a => new TaskAssigneeDto(a.UserId, a.UserName, a.UserEmail)).ToList(),
                t.SubTasks.Count(s => !s.IsDeleted),
                t.Comments.Count(c => !c.IsDeleted && !c.IsSystemLog)))
            .ToListAsync(ct);

        return new ProjectBoardDto(
            p.Id, p.Code, p.Name, p.Description, (int)p.Status,
            p.CustomerId, p.CustomerName, p.StartDate, p.EndDate, p.Color,
            tasks);
    }
}
