using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.StopTimeEntry;

/// <summary>
/// Görevdeki açık sayacı durdurur ve süreyi dakika olarak yazar.
/// </summary>
public record StopTimeEntryCommand(
    Guid TaskId,
    Guid UserId,
    string? Note) : IRequest<TimeEntryDto?>;

public class StopTimeEntryCommandHandler : IRequestHandler<StopTimeEntryCommand, TimeEntryDto?>
{
    private readonly ProjectManagementDbContext _db;

    public StopTimeEntryCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<TimeEntryDto?> Handle(StopTimeEntryCommand request, CancellationToken ct)
    {
        var entry = await _db.TimeEntries
            .Where(e => e.TaskId == request.TaskId
                        && e.UserId == request.UserId
                        && e.EndedAt == null
                        && !e.IsDeleted)
            .OrderByDescending(e => e.StartedAt)
            .FirstOrDefaultAsync(ct);

        if (entry == null) return null;

        var now = DateTime.UtcNow;
        entry.EndedAt = now;
        entry.DurationMinutes = Math.Max(0, (int)Math.Round((now - entry.StartedAt).TotalMinutes));
        if (!string.IsNullOrWhiteSpace(request.Note))
            entry.Note = request.Note.Trim();

        await _db.SaveChangesAsync(ct);

        return new TimeEntryDto(
            entry.Id, entry.TaskId, entry.UserId, entry.UserName,
            entry.StartedAt, entry.EndedAt, entry.DurationMinutes, entry.Note);
    }
}
