using MediatR;
using System;

namespace Wixi.Modules.Core.Application.Logs.Queries.GetLogStats;

public class GetLogStatsQuery : IRequest<GetLogStatsResponse>
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class GetLogStatsResponse
{
    public int Total { get; set; }
    public int Errors { get; set; }
    public int Warnings { get; set; }
    public int Info { get; set; }
    public int Debug { get; set; }
    public int TodayCount { get; set; }
}
