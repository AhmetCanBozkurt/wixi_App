using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.UpdateProject;

public record UpdateProjectCommand(
    Guid Id,
    string Name,
    string? Description,
    Guid? CustomerId,
    Guid? CariId,
    string? CustomerName,
    int Status,
    DateTime? StartDate,
    DateTime? EndDate,
    decimal? Budget,
    string? Currency,
    string? Color,
    string? UpdatedByUser) : IRequest<bool>;

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, bool>
{
    private readonly ProjectManagementDbContext _db;

    public UpdateProjectCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<bool> Handle(UpdateProjectCommand request, CancellationToken ct)
    {
        var project = await _db.Projects
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, ct);
        if (project == null) return false;

        project.Name = request.Name.Trim();
        project.Description = request.Description?.Trim();
        project.CustomerId = request.CustomerId;
        project.CariId = request.CariId;
        project.CustomerName = request.CustomerName?.Trim();
        project.Status = (ProjectStatus)request.Status;
        if (request.StartDate.HasValue) project.StartDate = request.StartDate.Value;
        project.EndDate = request.EndDate;
        project.Budget = request.Budget;
        project.Currency = request.Currency;
        project.Color = request.Color;
        project.UpdatedByUser = request.UpdatedByUser;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
