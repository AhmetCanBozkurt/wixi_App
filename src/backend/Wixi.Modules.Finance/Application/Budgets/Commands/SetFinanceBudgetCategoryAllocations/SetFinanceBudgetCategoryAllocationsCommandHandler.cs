using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.SetFinanceBudgetCategoryAllocations;

public class SetFinanceBudgetCategoryAllocationsCommandHandler
    : IRequestHandler<SetFinanceBudgetCategoryAllocationsCommand, FinanceBudgetDto>
{
    private readonly WixiFinanceDbContext _db;

    public SetFinanceBudgetCategoryAllocationsCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceBudgetDto> Handle(
        SetFinanceBudgetCategoryAllocationsCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.FinanceBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.TenantId == request.TenantId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        var incomingIds = request.Allocations.Select(a => a.CategoryId).ToHashSet();

        var toRemove = budget.Categories
            .Where(bc => !incomingIds.Contains(bc.CategoryId))
            .ToList();

        foreach (var bc in toRemove)
            _db.FinanceBudgetCategories.Remove(bc);

        foreach (var allocation in request.Allocations)
        {
            var category = await _db.FinanceCategories
                .FirstOrDefaultAsync(
                    c => c.Id == allocation.CategoryId && !c.IsDeleted &&
                         (c.IsDefault || c.TenantId == request.TenantId),
                    cancellationToken)
                ?? throw new InvalidOperationException($"Kategori bulunamadı: {allocation.CategoryId}");

            var existing = budget.Categories
                .FirstOrDefault(bc => bc.CategoryId == allocation.CategoryId);

            if (existing is not null)
            {
                existing.AllocatedAmount = allocation.AllocatedAmount;
            }
            else
            {
                var newBc = new WixiFinanceBudgetCategory
                {
                    BudgetId = budget.Id,
                    CategoryId = allocation.CategoryId,
                    AllocatedAmount = allocation.AllocatedAmount,
                    SpentAmount = 0,
                };
                newBc.Category = category;
                _db.FinanceBudgetCategories.Add(newBc);
                budget.Categories.Add(newBc);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        var reloaded = await _db.FinanceBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstAsync(b => b.Id == request.BudgetId, cancellationToken);

        return BudgetDtoMapper.ToDto(reloaded);
    }
}
