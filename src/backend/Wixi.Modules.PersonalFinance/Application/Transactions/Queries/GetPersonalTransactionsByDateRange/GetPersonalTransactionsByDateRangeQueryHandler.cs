using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactionsByDateRange;

public class GetPersonalTransactionsByDateRangeQueryHandler
    : IRequestHandler<GetPersonalTransactionsByDateRangeQuery, List<PersonalTransactionDto>>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalTransactionsByDateRangeQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<List<PersonalTransactionDto>> Handle(
        GetPersonalTransactionsByDateRangeQuery request,
        CancellationToken cancellationToken)
    {
        var transactions = await _db.PersonalTransactions
            .Include(t => t.Category)
            .Where(t =>
                t.UserId == request.UserId &&
                t.Date >= request.From &&
                t.Date <= request.To)
            .OrderByDescending(t => t.Date)
            .ToListAsync(cancellationToken);

        return transactions.Select(ToDto).ToList();
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
