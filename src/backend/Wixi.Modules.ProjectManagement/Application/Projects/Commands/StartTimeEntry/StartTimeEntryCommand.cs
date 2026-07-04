using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.StartTimeEntry;

/// <summary>
/// Görev üzerinde sayacı başlatır. Kural: bir kullanıcının aynı anda tek açık
/// kaydı olabilir — başka görevde açık sayaç varsa önce otomatik kapatılır.
/// </summary>
public record StartTimeEntryCommand(
    Guid TaskId,
    Guid UserId,
    string? UserName) : IRequest<TimeEntryDto?>;

public class StartTimeEntryCommandHandler : IRequestHandler<StartTimeEntryCommand, TimeEntryDto?>
{
    private readonly ProjectManagementDbContext _db;

    public StartTimeEntryCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<TimeEntryDto?> Handle(StartTimeEntryCommand request, CancellationToken ct)
    {
        var taskExists = await _db.Tasks
            .AnyAsync(t => t.Id == request.TaskId && !t.IsDeleted, ct);
        if (!taskExists) return null;

        var now = DateTime.UtcNow;

        // Kullanıcının açık sayaçlarını kapat (tek aktif entry kuralı)
        var openEntries = await _db.TimeEntries
            .Where(e => e.UserId == request.UserId && e.EndedAt == null && !e.IsDeleted)
            .ToListAsync(ct);

        foreach (var open in openEntries)
        {
            // Aynı görevde zaten çalışan sayaç varsa yenisini açma, onu döndür
            if (open.TaskId == request.TaskId)
                return ToDto(open);

            open.EndedAt = now;
            open.DurationMinutes = Math.Max(0, (int)Math.Round((now - open.StartedAt).TotalMinutes));
        }

        var entry = new WixiTimeEntry
        {
            TaskId = request.TaskId,
            UserId = request.UserId,
            UserName = request.UserName,
            StartedAt = now,
            CreatedByUser = request.UserName,
        };

        _db.TimeEntries.Add(entry);
        await _db.SaveChangesAsync(ct);

        return ToDto(entry);
    }

    private static TimeEntryDto ToDto(WixiTimeEntry e) =>
        new(e.Id, e.TaskId, e.UserId, e.UserName, e.StartedAt, e.EndedAt, e.DurationMinutes, e.Note);
}
