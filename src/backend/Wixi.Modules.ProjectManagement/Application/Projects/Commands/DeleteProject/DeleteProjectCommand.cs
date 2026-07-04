using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.DeleteProject;

public record DeleteProjectCommand(Guid Id) : IRequest<bool>;

public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, bool>
{
    private readonly ProjectManagementDbContext _db;

    public DeleteProjectCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<bool> Handle(DeleteProjectCommand request, CancellationToken ct)
    {
        var project = await _db.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, ct);
        if (project == null) return false;

        project.IsDeleted = true;
        project.IsActive = false;
        foreach (var task in project.Tasks)
        {
            task.IsDeleted = true;
            task.IsActive = false;
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
