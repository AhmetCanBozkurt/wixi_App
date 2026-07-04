using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.AddTaskComment;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.CreateProject;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.CreateTask;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.DeleteProject;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.DeleteTask;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.SetTaskAssignees;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.StartTimeEntry;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.StopTimeEntry;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.UpdateProject;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.UpdateTask;
using Wixi.Modules.ProjectManagement.Application.Projects.Commands.UpdateTaskStatus;
using Wixi.Modules.ProjectManagement.Application.Projects.Queries.GetProjectBoard;
using Wixi.Modules.ProjectManagement.Application.Projects.Queries.GetProjects;
using Wixi.Modules.ProjectManagement.Application.Projects.Queries.GetTaskById;

namespace Wixi.Modules.ProjectManagement.Presentation.Controllers;

/// <summary>
/// Store-admin proje & görev yönetimi (M14).
/// Tenant, X-Tenant-Slug header'ından çözülür; tüm veriler tenant'ın kendi DB'sindedir.
/// </summary>
[ApiController]
[Route("api/v1/store-admin/projects")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminProjectsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminProjectsController(IMediator mediator) => _mediator = mediator;

    private string CurrentUser =>
        User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? "StoreAdmin";

    private Guid CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;

    // ── Projeler ───────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetProjects([FromQuery] int? status, [FromQuery] string? search, CancellationToken ct)
        => Ok(await _mediator.Send(new GetProjectsQuery(status, search), ct));

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Proje adı zorunludur." });

        var project = await _mediator.Send(new CreateProjectCommand(
            request.Name, request.Description, request.CustomerId, request.CariId, request.CustomerName,
            request.StartDate, request.EndDate, request.Budget, request.Currency, request.Color, CurrentUser), ct);

        return Ok(project);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "Proje adı zorunludur." });

        var updated = await _mediator.Send(new UpdateProjectCommand(
            id, request.Name, request.Description, request.CustomerId, request.CariId, request.CustomerName,
            request.Status, request.StartDate, request.EndDate, request.Budget, request.Currency, request.Color, CurrentUser), ct);

        return updated ? NoContent() : NotFound(new { error = "Proje bulunamadı." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken ct)
    {
        var deleted = await _mediator.Send(new DeleteProjectCommand(id), ct);
        return deleted ? NoContent() : NotFound(new { error = "Proje bulunamadı." });
    }

    /// <summary>Kanban + Gantt datası tek istekte: proje + tüm görevler + atamalar.</summary>
    [HttpGet("{id:guid}/board")]
    public async Task<IActionResult> GetBoard(Guid id, CancellationToken ct)
    {
        var board = await _mediator.Send(new GetProjectBoardQuery(id), ct);
        return board is null ? NotFound(new { error = "Proje bulunamadı." }) : Ok(board);
    }

    // ── Görevler ───────────────────────────────────────────────────────

    [HttpPost("{id:guid}/tasks")]
    public async Task<IActionResult> CreateTask(Guid id, [FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Görev başlığı zorunludur." });

        var task = await _mediator.Send(new CreateTaskCommand(
            id, request.ParentTaskId, request.Title, request.Description,
            request.Priority, request.Status, request.StartDate, request.DueDate,
            request.DurationDays, request.Assignees, CurrentUser), ct);

        return task is null
            ? NotFound(new { error = "Proje veya üst görev bulunamadı." })
            : Ok(task);
    }

    [HttpGet("tasks/{taskId:guid}")]
    public async Task<IActionResult> GetTask(Guid taskId, CancellationToken ct)
    {
        var task = await _mediator.Send(new GetTaskByIdQuery(taskId), ct);
        return task is null ? NotFound(new { error = "Görev bulunamadı." }) : Ok(task);
    }

    [HttpPut("tasks/{taskId:guid}")]
    public async Task<IActionResult> UpdateTask(Guid taskId, [FromBody] UpdateTaskRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Görev başlığı zorunludur." });

        var updated = await _mediator.Send(new UpdateTaskCommand(
            taskId, request.Title, request.Description, request.Priority, request.Progress,
            request.StartDate, request.DueDate, request.DurationDays, CurrentUser), ct);

        return updated ? NoContent() : NotFound(new { error = "Görev bulunamadı." });
    }

    /// <summary>Kanban sürükle-bırak: durum + kolon içi sıra.</summary>
    [HttpPatch("tasks/{taskId:guid}/status")]
    public async Task<IActionResult> UpdateTaskStatus(Guid taskId, [FromBody] UpdateTaskStatusRequest request, CancellationToken ct)
    {
        var updated = await _mediator.Send(
            new UpdateTaskStatusCommand(taskId, request.Status, request.SortOrder, CurrentUser), ct);

        return updated ? NoContent() : NotFound(new { error = "Görev bulunamadı." });
    }

    [HttpPut("tasks/{taskId:guid}/assignees")]
    public async Task<IActionResult> SetAssignees(Guid taskId, [FromBody] List<AssigneeInput> assignees, CancellationToken ct)
    {
        var updated = await _mediator.Send(new SetTaskAssigneesCommand(taskId, assignees, CurrentUser), ct);
        return updated ? NoContent() : NotFound(new { error = "Görev bulunamadı." });
    }

    [HttpDelete("tasks/{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(Guid taskId, CancellationToken ct)
    {
        var deleted = await _mediator.Send(new DeleteTaskCommand(taskId), ct);
        return deleted ? NoContent() : NotFound(new { error = "Görev bulunamadı." });
    }

    // ── Zaman takibi ───────────────────────────────────────────────────

    /// <summary>Sayacı başlatır. Kullanıcının başka görevdeki açık sayacı otomatik kapanır.</summary>
    [HttpPost("tasks/{taskId:guid}/time/start")]
    public async Task<IActionResult> StartTime(Guid taskId, CancellationToken ct)
    {
        var entry = await _mediator.Send(new StartTimeEntryCommand(taskId, CurrentUserId, CurrentUser), ct);
        return entry is null ? NotFound(new { error = "Görev bulunamadı." }) : Ok(entry);
    }

    /// <summary>Görevdeki açık sayacı durdurur.</summary>
    [HttpPost("tasks/{taskId:guid}/time/stop")]
    public async Task<IActionResult> StopTime(Guid taskId, [FromBody] StopTimeRequest? request, CancellationToken ct)
    {
        var entry = await _mediator.Send(new StopTimeEntryCommand(taskId, CurrentUserId, request?.Note), ct);
        return entry is null
            ? NotFound(new { error = "Bu görevde çalışan sayaç bulunamadı." })
            : Ok(entry);
    }

    // ── Yorumlar ───────────────────────────────────────────────────────

    [HttpPost("tasks/{taskId:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid taskId, [FromBody] AddCommentRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { error = "Yorum içeriği boş olamaz." });

        var comment = await _mediator.Send(
            new AddTaskCommentCommand(taskId, request.Content, null, CurrentUser), ct);

        return comment is null ? NotFound(new { error = "Görev bulunamadı." }) : Ok(comment);
    }
}

// ── Request DTOs ───────────────────────────────────────────────────────

public record CreateProjectRequest(
    string Name,
    string? Description,
    Guid? CustomerId,
    Guid? CariId,
    string? CustomerName,
    DateTime? StartDate,
    DateTime? EndDate,
    decimal? Budget,
    string? Currency,
    string? Color);

public record UpdateProjectRequest(
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
    string? Color);

public record CreateTaskRequest(
    string Title,
    string? Description,
    Guid? ParentTaskId,
    int Priority = 1,
    int Status = 0,
    DateTime? StartDate = null,
    DateTime? DueDate = null,
    int? DurationDays = null,
    List<AssigneeInput>? Assignees = null);

public record UpdateTaskRequest(
    string Title,
    string? Description,
    int Priority,
    int Progress,
    DateTime? StartDate,
    DateTime? DueDate,
    int? DurationDays);

public record UpdateTaskStatusRequest(int Status, int SortOrder);

public record AddCommentRequest(string Content);

public record StopTimeRequest(string? Note);
