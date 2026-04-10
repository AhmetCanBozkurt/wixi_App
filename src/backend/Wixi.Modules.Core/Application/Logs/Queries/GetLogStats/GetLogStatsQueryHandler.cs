using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Wixi.Modules.Core.Application.Logs.Queries.GetLogStats;

public class GetLogStatsQueryHandler : IRequestHandler<GetLogStatsQuery, GetLogStatsResponse>
{
    private readonly WixiCoreDbContext _context;
    
    public GetLogStatsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }
    
    public async Task<GetLogStatsResponse> Handle(GetLogStatsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditLogs.AsNoTracking().Where(x => !x.IsDeleted);
        
        if (request.StartDate.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= request.StartDate.Value);
        }
        if (request.EndDate.HasValue)
        {
            var end = request.EndDate.Value.AddDays(1);
            query = query.Where(x => x.CreatedAt < end);
        }
        
        var total = await query.CountAsync(cancellationToken);
        
        var errors = await query.CountAsync(x => x.Action.Contains("FAILED") || x.Action.Contains("ERROR"), cancellationToken);
        var warnings = await query.CountAsync(x => x.Action.Contains("WARNING"), cancellationToken);
        
        var info = total - errors - warnings;
        
        var todayStart = DateTime.UtcNow.Date;
        var todayCount = await query.CountAsync(x => x.CreatedAt >= todayStart, cancellationToken);
        
        return new GetLogStatsResponse
        {
            Total = total,
            Errors = errors,
            Warnings = warnings,
            Info = info,
            Debug = 0,
            TodayCount = todayCount
        };
    }
}
