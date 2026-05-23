using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.Finance.Application.Transactions.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Transactions.Queries.GetFinanceTransactionById;

public class GetFinanceTransactionByIdQueryHandler
    : IRequestHandler<GetFinanceTransactionByIdQuery, FinanceTransactionDto>
{
    private readonly WixiFinanceDbContext _db;

    public GetFinanceTransactionByIdQueryHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceTransactionDto> Handle(
        GetFinanceTransactionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var transaction = await _db.FinanceTransactions
            .Include(t => t.Category)
            .FirstOrDefaultAsync(
                t => t.Id == request.TransactionId && t.TenantId == request.TenantId,
                cancellationToken)
            ?? throw new InvalidOperationException("İşlem bulunamadı.");

        return ToDto(transaction);
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
