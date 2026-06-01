using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.Finance.Application.Common;
using Wixi.Modules.Finance.Application.Transactions.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTransactions;

public class GetFinanceTransactionsQueryHandler
    : IRequestHandler<GetFinanceTransactionsQuery, PagedResult<FinanceTransactionDto>>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceTransactionsQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<PagedResult<FinanceTransactionDto>> Handle(
        GetFinanceTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<WixiFinanceTransaction> query = _db.FinanceTransactions
            .Include(t => t.Category)
            .Where(t => t.TenantId == request.TenantId);

        if (request.Type.HasValue)
            query = query.Where(t => t.Type == request.Type.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == request.CategoryId.Value);

        if (request.From.HasValue)
            query = query.Where(t => t.Date >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(t => t.Date <= request.To.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.Trim();
            query = query.Where(t => EF.Functions.Like(t.Description, $"%{searchTerm}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var items = await query
            .OrderByDescending(t => t.Date)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<FinanceTransactionDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    private static FinanceTransactionDto ToDto(WixiFinanceTransaction t) => new()
    {
        Id = t.Id,
        TenantId = t.TenantId,
        CategoryId = t.CategoryId,
        CategoryName = t.Category?.Name ?? string.Empty,
        CategoryIcon = t.Category?.Icon ?? string.Empty,
        CategoryColor = t.Category?.Color ?? string.Empty,
        BudgetId = t.BudgetId,
        Amount = t.Amount,
        Description = t.Description,
        Date = t.Date,
        Type = t.Type,
        Tags = t.Tags != null ? JsonSerializer.Deserialize<List<string>>(t.Tags) : null,
        IsInstallment = t.IsInstallment,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
    };
}
