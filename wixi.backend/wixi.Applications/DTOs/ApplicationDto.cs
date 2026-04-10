namespace wixi.Applications.DTOs;

public class ApplicationDto
{
    public long Id { get; set; }
    public int ClientId { get; set; }
    public string? ClientName { get; set; }
    public int ApplicationTemplateId { get; set; }
    public string? TemplateName { get; set; }
    public string ApplicationNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public DateTime? ExpectedCompletionDate { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ApplicationStepDto>? Steps { get; set; }
}

public class CreateApplicationDto
{
    public int ClientId { get; set; }
    public int ApplicationTemplateId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? ExpectedCompletionDate { get; set; }
}

public class UpdateApplicationDto
{
    public string? Status { get; set; }
    public int? ProgressPercentage { get; set; }
    public DateTime? ExpectedCompletionDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
}

public class ApplicationStepDto
{
    public long Id { get; set; }
    public long ApplicationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int StepOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? CompletionDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? AssignedTo { get; set; }
    public List<ApplicationSubStepDto>? SubSteps { get; set; }
}

public class ApplicationSubStepDto
{
    public long Id { get; set; }
    public long ApplicationStepId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SubStepOrder { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? FileNumber { get; set; }
    public string? InfoMessage { get; set; }
    public DateTime? CompletionDate { get; set; }
}

public class ApplicationHistoryDto
{
    public long Id { get; set; }
    public long ApplicationId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? Description { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserType { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StepUpdateDto
{
    public string Status { get; set; } = string.Empty; // NotStarted, InProgress, Completed, Blocked
    public string? Notes { get; set; }
    public int? AssignedToUserId { get; set; }
}

public class SubStepUpdateDto
{
    public string Status { get; set; } = string.Empty; // NotStarted, InProgress, Completed
    public string? Notes { get; set; }
}

