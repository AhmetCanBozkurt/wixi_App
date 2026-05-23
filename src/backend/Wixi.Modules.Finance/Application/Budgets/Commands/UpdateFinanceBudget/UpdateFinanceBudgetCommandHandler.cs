using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Application.Budgets.Dto;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Budgets.Commands.UpdateFinanceBudget;

public class UpdateFinanceBudgetCommandHandler
    : IRequestHandler<UpdateFinanceBudgetCommand, FinanceBudgetDto>
{
    private readonly WixiFinanceDbContext _db;

    public UpdateFinanceBudgetCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<FinanceBudgetDto> Handle(
        UpdateFinanceBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var budget = await _db.FinanceBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.TenantId == request.TenantId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        budget.Name = dto.Name;

        if (dto.StartDate.HasValue) budget.StartDate = dto.StartDate.Value;
        if (dto.EndDate.HasValue) budget.EndDate = dto.EndDate.Value;
        if (dto.TotalAmount.HasValue) budget.TotalAmount = dto.TotalAmount.Value;
        if (dto.Status.HasValue) budget.Status = dto.Status.Value;
        if (dto.PeriodType.HasValue) budget.PeriodType = dto.PeriodType.Value;
        if (dto.AutoRenew.HasValue) budget.AutoRenew = dto.AutoRenew.Value;

        budget.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return BudgetDtoMapper.ToDto(budget);
    }
}
