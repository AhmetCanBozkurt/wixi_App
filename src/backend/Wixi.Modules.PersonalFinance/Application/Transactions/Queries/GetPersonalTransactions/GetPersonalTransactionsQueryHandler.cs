using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactions;

public class GetPersonalTransactionsQueryHandler
    : IRequestHandler<GetPersonalTransactionsQuery, PagedResult<PersonalTransactionDto>>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalTransactionsQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PagedResult<PersonalTransactionDto>> Handle(
        GetPersonalTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<WixiPersonalTransaction> query = _db.PersonalTransactions
            .Include(t => t.Category)
            .Where(t => t.UserId == request.UserId);

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

        return new PagedResult<PersonalTransactionDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    private static PersonalTransactionDto ToDto(WixiPersonalTransaction t) => new()
    {
        Id = t.Id,
        CategoryId = t.CategoryId,
        CategoryName = t.Category?.Name ?? string.Empty,
        CategoryIcon = t.Category?.Icon ?? string.Empty,
        CategoryColor = t.Category?.Color ?? string.Empty,
        BudgetId = t.BudgetId,
        HouseholdId = t.HouseholdId,
        Amount = t.Amount,
        Description = t.Description,
        Date = t.Date,
        Type = t.Type,
        Tags = t.Tags != null
            ? JsonSerializer.Deserialize<List<string>>(t.Tags)
            : null,
        IsInstallment = t.IsInstallment,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
    };
}
