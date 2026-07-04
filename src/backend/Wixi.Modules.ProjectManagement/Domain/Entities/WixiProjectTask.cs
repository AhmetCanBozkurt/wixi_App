using Wixi.Shared.Domain.Entities;

namespace Wixi.Modules.ProjectManagement.Domain.Entities;

// System.Threading.Tasks.TaskStatus ile çakışmaması için ProjectTask* adlandırması
public enum ProjectTaskStatus { Todo = 0, InProgress = 1, Review = 2, Done = 3 }
public enum ProjectTaskPriority { Low = 0, Medium = 1, High = 2, Urgent = 3 }

/// <summary>
/// Görev. ParentTaskId ile alt görev hiyerarşisi kurulur (self-FK).
/// SortOrder kanban kolonu içindeki sırayı tutar.
/// </summary>
public class WixiProjectTask : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProjectId { get; set; }
    public WixiProject? Project { get; set; }

    public Guid? ParentTaskId { get; set; }            // alt görev → üst görev
    public WixiProjectTask? ParentTask { get; set; }
    public ICollection<WixiProjectTask> SubTasks { get; set; } = [];

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ProjectTaskStatus Status { get; set; } = ProjectTaskStatus.Todo;
    public ProjectTaskPriority Priority { get; set; } = ProjectTaskPriority.Medium;
    public int Progress { get; set; } = 0;             // 0-100

    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int? DurationDays { get; set; }             // Gantt çizimi
    public int SortOrder { get; set; } = 0;
    public DateTime? CompletedAt { get; set; }

    public ICollection<WixiTaskAssignee> Assignees { get; set; } = [];
    public ICollection<WixiTaskComment> Comments { get; set; } = [];

    // IAuditable
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUser { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
