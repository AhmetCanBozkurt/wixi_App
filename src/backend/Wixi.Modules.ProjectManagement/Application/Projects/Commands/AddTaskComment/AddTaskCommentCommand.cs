using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ProjectManagement.Application.Projects.Dto;
using Wixi.Modules.ProjectManagement.Domain.Entities;
using Wixi.Modules.ProjectManagement.Infrastructure.Data;

namespace Wixi.Modules.ProjectManagement.Application.Projects.Commands.AddTaskComment;

public record AddTaskCommentCommand(
    Guid TaskId,
    string Content,
    Guid? AuthorUserId,
    string? AuthorName) : IRequest<TaskCommentDto?>;

public class AddTaskCommentCommandHandler : IRequestHandler<AddTaskCommentCommand, TaskCommentDto?>
{
    private readonly ProjectManagementDbContext _db;

    public AddTaskCommentCommandHandler(ProjectManagementDbContext db) => _db = db;

    public async Task<TaskCommentDto?> Handle(AddTaskCommentCommand request, CancellationToken ct)
    {
        var taskExists = await _db.Tasks
            .AnyAsync(t => t.Id == request.TaskId && !t.IsDeleted, ct);
        if (!taskExists) return null;

        var comment = new WixiTaskComment
        {
            TaskId = request.TaskId,
            AuthorUserId = request.AuthorUserId,
            AuthorName = request.AuthorName,
            Content = request.Content.Trim(),
            IsSystemLog = false,
            CreatedByUser = request.AuthorName,
        };

        _db.TaskComments.Add(comment);
        await _db.SaveChangesAsync(ct);

        return new TaskCommentDto(
            comment.Id, comment.TaskId, comment.AuthorUserId, comment.AuthorName,
            comment.Content, comment.IsSystemLog, comment.CreatedAt);
    }
}
