using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.CreateFinanceBudget;

public class CreateFinanceBudgetCommandHandler
    : IRequestHandler<CreateFinanceBudgetCommand, FinanceBudgetDto>
{
    private readonly WixiFinanceDbContext _db;

    public CreateFinanceBudgetCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceBudgetDto> Handle(
        CreateFinanceBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        if (dto.EndDate < dto.StartDate)
            throw new InvalidOperationException("Bitiş tarihi başlangıç tarihinden önce olamaz.");

        var budget = new WixiFinanceBudget
        {
            TenantId = request.TenantId,
            Name = dto.Name,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalAmount = dto.TotalAmount,
            PeriodType = dto.PeriodType,
            AutoRenew = dto.AutoRenew,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.FinanceBudgets.Add(budget);

        if (dto.CategoryAllocations is { Count: > 0 })
        {
            foreach (var allocation in dto.CategoryAllocations)
            {
                var category = await _db.FinanceCategories
                    .FirstOrDefaultAsync(
                        c => c.Id == allocation.CategoryId && !c.IsDeleted &&
                             (c.IsDefault || c.TenantId == request.TenantId),
                        cancellationToken)
                    ?? throw new InvalidOperationException($"Kategori bulunamadı: {allocation.CategoryId}");

                var budgetCategory = new WixiFinanceBudgetCategory
                {
                    BudgetId = budget.Id,
                    CategoryId = allocation.CategoryId,
                    AllocatedAmount = allocation.AllocatedAmount,
                    SpentAmount = 0,
                };

                budgetCategory.Category = category;
                _db.FinanceBudgetCategories.Add(budgetCategory);
                budget.Categories.Add(budgetCategory);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        return BudgetDtoMapper.ToDto(budget);
    }
}
