using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Queries.GetProjects;

public record GetProjectsQuery(int? Status, string? Search) : IRequest<List<ProjectListDto>>;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, List<ProjectListDto>>
{
    private readonly ProjectManagementDbContext _db;

    public GetProjectsQueryHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<List<ProjectListDto>> Handle(GetProjectsQuery request, CancellationToken ct)
    {
        var query = _db.Projects
            .AsNoTracking()
            .Where(p => !p.IsDeleted);

        if (request.Status.HasValue)
            query = query.Where(p => (int)p.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s)
                || p.Code.ToLower().Contains(s)
                || (p.CustomerName != null && p.CustomerName.ToLower().Contains(s)));
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectListDto(
                p.Id, p.Code, p.Name, p.Description, (int)p.Status,
                p.CustomerId, p.CariId, p.CustomerName,
                p.StartDate, p.EndDate, p.Budget, p.Currency, p.Color,
                p.Tasks.Count(t => !t.IsDeleted),
                p.Tasks.Count(t => !t.IsDeleted && t.Status == ProjectTaskStatus.Done),
                p.CreatedAt))
            .ToListAsync(ct);
    }
}
