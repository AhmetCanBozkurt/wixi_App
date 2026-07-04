using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.DeleteTask;

public record DeleteTaskCommand(Guid Id) : IRequest<bool>;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly ProjectManagementDbContext _db;

    public DeleteTaskCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken ct)
    {
        var task = await _db.Tasks
            .Include(t => t.SubTasks)
            .FirstOrDefaultAsync(t => t.Id == request.Id && !t.IsDeleted, ct);
        if (task == null) return false;

        task.IsDeleted = true;
        task.IsActive = false;
        foreach (var sub in task.SubTasks)
        {
            sub.IsDeleted = true;
            sub.IsActive = false;
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
