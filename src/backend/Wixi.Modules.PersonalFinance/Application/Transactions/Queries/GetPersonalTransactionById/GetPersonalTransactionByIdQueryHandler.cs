using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.PersonalFinance.Application.Transactions.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Queries.GetPersonalTransactionById;

public class GetPersonalTransactionByIdQueryHandler
    : IRequestHandler<GetPersonalTransactionByIdQuery, PersonalTransactionDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalTransactionByIdQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalTransactionDto> Handle(
        GetPersonalTransactionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var transaction = await _db.PersonalTransactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(
                t => t.Id == request.TransactionId && t.UserId == request.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException("İşlem bulunamadı.");

        return ToDto(transaction);
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
