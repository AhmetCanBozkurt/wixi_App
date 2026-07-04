using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.CreateTask;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.SetTaskAssignees;

/// <summary>
/// Görev atamalarını topluca değiştirir (replace semantics).
/// </summary>
public record SetTaskAssigneesCommand(
    Guid TaskId,
    List<AssigneeInput> Assignees,
    string? ChangedBy) : IRequest<bool>;

public class SetTaskAssigneesCommandHandler : IRequestHandler<SetTaskAssigneesCommand, bool>
{
    private readonly ProjectManagementDbContext _db;

    public SetTaskAssigneesCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<bool> Handle(SetTaskAssigneesCommand request, CancellationToken ct)
    {
        var task = await _db.Tasks
            .Include(t => t.Assignees)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, ct);
        if (task == null) return false;

        var wanted = request.Assignees.DistinctBy(a => a.UserId).ToList();
        var wantedIds = wanted.Select(a => a.UserId).ToHashSet();

        // Çıkarılanlar
        var toRemove = task.Assignees.Where(a => !wantedIds.Contains(a.UserId)).ToList();
        foreach (var a in toRemove)
            _db.TaskAssignees.Remove(a);

        // Eklenenler
        var existingIds = task.Assignees.Select(a => a.UserId).ToHashSet();
        foreach (var a in wanted.Where(x => !existingIds.Contains(x.UserId)))
            task.Assignees.Add(new WixiTaskAssignee { UserId = a.UserId, UserName = a.UserName, UserEmail = a.UserEmail });

        task.UpdatedByUser = request.ChangedBy;
        await _db.SaveChangesAsync(ct);
        return true;
    }
}
