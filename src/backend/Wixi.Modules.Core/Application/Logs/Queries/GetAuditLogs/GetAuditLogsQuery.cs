using MediatR;
using System;
using System.Collections.Generic;

namespace Wixi.Modules.Core.Application.Logs.Queries.GetAuditLogs;

public class GetAuditLogsQuery : IRequest<GetAuditLogsResponse>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string? Action { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class GetAuditLogsResponse
{
    public int TotalCount { get; set; }
    public IEnumerable<AuditLogDto> Items { get; set; } = new List<AuditLogDto>();
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string? EntityName { get; set; }
    public string? EntityId { get; set; }
    public string? Email { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? TableName { get; set; }
    public DateTime CreatedAt { get; set; }
}
