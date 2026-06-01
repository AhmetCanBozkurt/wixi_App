using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Queries.GetPersonalBudgets;

public class GetPersonalBudgetsQueryHandler
    : IRequestHandler<GetPersonalBudgetsQuery, PagedResult<PersonalBudgetSummaryDto>>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalBudgetsQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PagedResult<PersonalBudgetSummaryDto>> Handle(
        GetPersonalBudgetsQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<WixiPersonalBudget> query = _db.PersonalBudgets
            .Include(b => b.Categories)
            .Where(b => b.UserId == request.UserId);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var items = await query
            .OrderByDescending(b => b.StartDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<PersonalBudgetSummaryDto>
        {
            Items = items.Select(ToSummaryDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    private static PersonalBudgetSummaryDto ToSummaryDto(WixiPersonalBudget b)
    {
        var totalSpent = b.Categories.Sum(c => c.SpentAmount);
        return new PersonalBudgetSummaryDto
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
            AutoRenew = b.AutoRenew,
            CategoryCount = b.Categories.Count,
            CreatedAt = b.CreatedAt,
        };
    }
}
