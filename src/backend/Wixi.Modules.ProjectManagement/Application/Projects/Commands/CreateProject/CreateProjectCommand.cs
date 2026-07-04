using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.CreateProject;

public record CreateProjectCommand(
    string Name,
    string? Description,
    Guid? CustomerId,
    Guid? CariId,
    string? CustomerName,
    DateTime? StartDate,
    DateTime? EndDate,
    decimal? Budget,
    string? Currency,
    string? Color,
    string? CreatedByUser) : IRequest<ProjectListDto>;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, ProjectListDto>
{
    private readonly ProjectManagementDbContext _db;

    public CreateProjectCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<ProjectListDto> Handle(CreateProjectCommand request, CancellationToken ct)
    {
        // 'PRJ-00001' — mevcut en büyük sıra numarasından devam et (silinenler dahil)
        var lastCode = await _db.Projects
            .IgnoreQueryFilters()
            .OrderByDescending(p => p.Code)
            .Select(p => p.Code)
            .FirstOrDefaultAsync(ct);

        var nextNumber = 1;
        if (lastCode != null && lastCode.StartsWith("PRJ-") && int.TryParse(lastCode[4..], out var n))
            nextNumber = n + 1;

        var project = new WixiProject
        {
            Code = $"PRJ-{nextNumber:D5}",
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CustomerId = request.CustomerId,
            CariId = request.CariId,
            CustomerName = request.CustomerName?.Trim(),
            StartDate = request.StartDate ?? DateTime.UtcNow,
            EndDate = request.EndDate,
            Budget = request.Budget,
            Currency = request.Currency,
            Color = request.Color,
            CreatedByUser = request.CreatedByUser,
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync(ct);

        return new ProjectListDto(
            project.Id, project.Code, project.Name, project.Description, (int)project.Status,
            project.CustomerId, project.CariId, project.CustomerName,
            project.StartDate, project.EndDate, project.Budget, project.Currency, project.Color,
            0, 0, project.CreatedAt);
    }
}
