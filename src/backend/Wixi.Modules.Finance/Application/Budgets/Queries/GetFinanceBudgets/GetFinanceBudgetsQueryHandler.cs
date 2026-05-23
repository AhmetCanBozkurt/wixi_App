using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Application.Common;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Queries.GetFinanceBudgets;

public class GetFinanceBudgetsQueryHandler
    : IRequestHandler<GetFinanceBudgetsQuery, PagedResult<FinanceBudgetSummaryDto>>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceBudgetsQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<PagedResult<FinanceBudgetSummaryDto>> Handle(
        GetFinanceBudgetsQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<WixiFinanceBudget> query = _db.FinanceBudgets
            .Include(b => b.Categories)
            .Where(b => b.TenantId == request.TenantId);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<FinanceBudgetSummaryDto>
        {
            Items = items.Select(ToSummaryDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    private static FinanceBudgetSummaryDto ToSummaryDto(WixiFinanceBudget b)
    {
        var totalSpent = b.Categories.Sum(c => c.SpentAmount);
        return new FinanceBudgetSummaryDto
        {
            Id = b.Id,
            Name = b.Name,
            StartDate = b.StartDate,
            EndDate = b.EndDate,
            TotalAmount = b.TotalAmount,
            TotalSpent = totalSpent,
            TotalRemaining = b.TotalAmount - totalSpent,
            Status = b.Status,
            PeriodType = b.PeriodType,
            CategoryCount = b.Categories.Count,
            CreatedAt = b.CreatedAt,
        };
    }
}
