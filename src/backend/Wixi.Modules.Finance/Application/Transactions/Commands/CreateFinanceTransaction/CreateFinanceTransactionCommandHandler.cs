using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Wixi.Modules.Finance.Application.Transactions.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Domain.Enums;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Transactions.Commands.CreateFinanceTransaction;

public class CreateFinanceTransactionCommandHandler
    : IRequestHandler<CreateFinanceTransactionCommand, FinanceTransactionDto>
{
    private readonly WixiFinanceDbContext _db;

    public CreateFinanceTransactionCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceTransactionDto> Handle(
        CreateFinanceTransactionCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var category = await _db.FinanceCategories
            .FirstOrDefaultAsync(
                c => c.Id == dto.CategoryId && !c.IsDeleted &&
                     (c.IsDefault || c.TenantId == request.TenantId),
                cancellationToken)
            ?? throw new InvalidOperationException("Kategori bulunamadı.");

        var entity = new WixiFinanceTransaction
        {
            TenantId = request.TenantId,
            CategoryId = dto.CategoryId,
            BudgetId = dto.BudgetId,
            Amount = dto.Amount,
            Description = dto.Description,
            Date = dto.Date,
            Type = dto.Type,
            IsInstallment = dto.IsInstallment,
            Tags = dto.Tags is { Count: > 0 } ? JsonSerializer.Serialize(dto.Tags) : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.FinanceTransactions.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        if (entity.BudgetId.HasValue)
            await RecalculateBudgetCategorySpent(entity.BudgetId.Value, entity.CategoryId, cancellationToken);

        entity.Category = category;
        return ToDto(entity);
    }

    private async Task RecalculateBudgetCategorySpent(Guid budgetId, Guid categoryId, CancellationToken ct)
    {
        var bc = await _db.FinanceBudgetCategories
            .FirstOrDefaultAsync(x => x.BudgetId == budgetId && x.CategoryId == categoryId, ct);
        if (bc is null) return;
        bc.SpentAmount = await _db.FinanceTransactions
            .Where(t => t.BudgetId == budgetId && t.CategoryId == categoryId && t.Type == FinanceTransactionType.Expense)
            .SumAsync(t => t.Amount, ct);
        await _db.SaveChangesAsync(ct);
    }

    internal static FinanceTransactionDto ToDto(WixiFinanceTransaction t) => new()
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
