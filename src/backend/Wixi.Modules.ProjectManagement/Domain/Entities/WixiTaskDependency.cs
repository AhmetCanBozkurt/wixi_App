namespace Wixi.Modules.ProjectManagement.Domain.Entities;

public enum TaskDependencyType { FinishToStart = 0, StartToStart = 1 }

/// <summary>
/// Gantt bağımlılığı: TaskId, DependsOnTaskId bitmeden başlayamaz (soft uyarı — O-P4).
/// </summary>
public class WixiTaskDependency
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TaskId { get; set; }
    public WixiProjectTask? Task { get; set; }

    public Guid DependsOnTaskId { get; set; }
    public WixiProjectTask? DependsOnTask { get; set; }

    public TaskDependencyType Type { get; set; } = TaskDependencyType.FinishToStart;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
