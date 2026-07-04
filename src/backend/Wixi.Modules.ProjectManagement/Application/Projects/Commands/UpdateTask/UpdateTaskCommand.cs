using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.UpdateTask;

public record UpdateTaskCommand(
    Guid Id,
    string Title,
    string? Description,
    int Priority,
    int Progress,
    DateTime? StartDate,
    DateTime? DueDate,
    int? DurationDays,
    string? UpdatedByUser) : IRequest<bool>;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, bool>
{
    private readonly ProjectManagementDbContext _db;

    public UpdateTaskCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateTaskCommand request, CancellationToken ct)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.Id && !t.IsDeleted, ct);
        if (task == null) return false;

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim();
        task.Priority = (ProjectTaskPriority)request.Priority;
        task.Progress = Math.Clamp(request.Progress, 0, 100);
        task.StartDate = request.StartDate;
        task.DueDate = request.DueDate;
        task.DurationDays = request.DurationDays;
        task.UpdatedByUser = request.UpdatedByUser;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
