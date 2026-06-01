using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Wixi.Modules.Core.Application.Logs.Queries.GetAuditLogs;
using Wixi.Modules.Core.Application.Logs.Queries.GetLogStats;

namespace Wixi.API.Controllers.Core;

[ApiController]
[Route("api/v1/admin/logs")]
// [Authorize] // Secure once fully implemented
public class SystemLogController : ControllerBase
{
    private readonly IMediator _mediator;

    public SystemLogController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("audit")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string? action = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var query = new GetAuditLogsQuery
        {
            Page = page,
            PageSize = pageSize,
            Action = action,
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("audit/stats")]
    public async Task<IActionResult> GetAuditLogStats([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var query = new GetLogStatsQuery
        {
            StartDate = startDate,
            EndDate = endDate
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
