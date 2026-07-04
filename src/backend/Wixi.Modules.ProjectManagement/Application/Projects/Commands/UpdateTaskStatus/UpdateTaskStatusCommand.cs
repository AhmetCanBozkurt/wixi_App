using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.UpdateTaskStatus;

/// <summary>
/// Kanban sürükle-bırak: görevin durumunu ve kolon içi sırasını günceller.
/// Durum değişimi aktivite loguna (IsSystemLog) yazılır.
/// </summary>
public record UpdateTaskStatusCommand(
    Guid Id,
    int Status,
    int SortOrder,
    string? ChangedBy) : IRequest<bool>;

public class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand, bool>
{
    private readonly ProjectManagementDbContext _db;

    public UpdateTaskStatusCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateTaskStatusCommand request, CancellationToken ct)
    {
        var task = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == request.Id && !t.IsDeleted, ct);
        if (task == null) return false;

        var oldStatus = task.Status;
        var newStatus = (ProjectTaskStatus)request.Status;

        task.Status = newStatus;
        task.SortOrder = request.SortOrder;
        task.UpdatedByUser = request.ChangedBy;

        if (newStatus == ProjectTaskStatus.Done)
        {
            task.CompletedAt = DateTime.UtcNow;
            task.Progress = 100;
        }
        else if (oldStatus == ProjectTaskStatus.Done)
        {
            task.CompletedAt = null;
            if (task.Progress == 100) task.Progress = 0;
        }

        if (oldStatus != newStatus)
        {
            _db.TaskComments.Add(new WixiTaskComment
            {
                TaskId = task.Id,
                AuthorName = request.ChangedBy,
                Content = $"Durum değişti: {oldStatus} → {newStatus}",
                IsSystemLog = true,
                CreatedByUser = request.ChangedBy,
            });
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
