using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Wixi.Modules.Core.Application.Logs.Queries.GetAuditLogs;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, GetAuditLogsResponse>
{
    private readonly WixiCoreDbContext _context;
    
    public GetAuditLogsQueryHandler(WixiCoreDbContext context)
    {
        _context = context;
    }
    
    public async Task<GetAuditLogsResponse> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditLogs.AsNoTracking().Where(x => !x.IsDeleted);
        
        if (!string.IsNullOrEmpty(request.Action) && request.Action != "all")
        {
            query = query.Where(x => x.Action.Contains(request.Action));
        }
        
        if (request.StartDate.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= request.StartDate.Value);
        }
        
        if (request.EndDate.HasValue)
        {
            // Add 1 day to end date to include the whole entire day
            var end = request.EndDate.Value.AddDays(1);
            query = query.Where(x => x.CreatedAt < end);
        }
        
        var totalCount = await query.CountAsync(cancellationToken);
        
        var logs = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(x => new AuditLogDto
            {
                Id = x.Id,
                Action = x.Action,
                UserId = x.UserId,
                EntityName = "User", // Mapping placeholder till real entity tracking
                EntityId = x.UserId,
                Email = x.Email,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                TableName = x.TableName,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
            
        return new GetAuditLogsResponse
        {
            TotalCount = totalCount,
            Items = logs
        };
    }
}
