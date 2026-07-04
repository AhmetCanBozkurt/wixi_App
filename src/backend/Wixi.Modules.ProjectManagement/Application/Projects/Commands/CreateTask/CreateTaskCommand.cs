using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.CreateTask;

public record AssigneeInput(Guid UserId, string? UserName, string? UserEmail);

public record CreateTaskCommand(
    Guid ProjectId,
    Guid? ParentTaskId,
    string Title,
    string? Description,
    int Priority,
    int Status,
    DateTime? StartDate,
    DateTime? DueDate,
    int? DurationDays,
    List<AssigneeInput>? Assignees,
    string? CreatedByUser) : IRequest<TaskBoardDto?>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskBoardDto?>
{
    private readonly ProjectManagementDbContext _db;

    public CreateTaskCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<TaskBoardDto?> Handle(CreateTaskCommand request, CancellationToken ct)
    {
        var projectExists = await _db.Projects
            .AnyAsync(p => p.Id == request.ProjectId && !p.IsDeleted, ct);
        if (!projectExists) return null;

        if (request.ParentTaskId.HasValue)
        {
            var parentValid = await _db.Tasks.AnyAsync(
                t => t.Id == request.ParentTaskId.Value && t.ProjectId == request.ProjectId && !t.IsDeleted, ct);
            if (!parentValid) return null;
        }

        var status = (ProjectTaskStatus)request.Status;

        // Kolon sonuna ekle
        var maxSort = await _db.Tasks
            .Where(t => t.ProjectId == request.ProjectId && t.Status == status && !t.IsDeleted)
            .Select(t => (int?)t.SortOrder)
            .MaxAsync(ct) ?? -1;

        var task = new WixiProjectTask
        {
            ProjectId = request.ProjectId,
            ParentTaskId = request.ParentTaskId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Status = status,
            Priority = (ProjectTaskPriority)request.Priority,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            DurationDays = request.DurationDays,
            SortOrder = maxSort + 1,
            CreatedByUser = request.CreatedByUser,
        };

        if (request.Assignees is { Count: > 0 })
        {
            foreach (var a in request.Assignees.DistinctBy(x => x.UserId))
                task.Assignees.Add(new WixiTaskAssignee { UserId = a.UserId, UserName = a.UserName, UserEmail = a.UserEmail });
        }

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync(ct);

        return new TaskBoardDto(
            task.Id, task.ProjectId, task.ParentTaskId, task.Title,
            (int)task.Status, (int)task.Priority, task.Progress,
            task.StartDate, task.DueDate, task.DurationDays, task.SortOrder, task.CompletedAt,
            task.Assignees.Select(a => new TaskAssigneeDto(a.UserId, a.UserName, a.UserEmail)).ToList(),
            0, 0);
    }
}
