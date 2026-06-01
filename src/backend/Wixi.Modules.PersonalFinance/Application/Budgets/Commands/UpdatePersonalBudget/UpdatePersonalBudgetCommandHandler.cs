using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.UpdatePersonalBudget;

public class UpdatePersonalBudgetCommandHandler
    : IRequestHandler<UpdatePersonalBudgetCommand, PersonalBudgetDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public UpdatePersonalBudgetCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalBudgetDto> Handle(
        UpdatePersonalBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.PersonalBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.UserId == request.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

        var dto = request.Dto;

        budget.Name = dto.Name;

        if (dto.StartDate.HasValue)
            budget.StartDate = dto.StartDate.Value;

        if (dto.EndDate.HasValue)
        {
            var effectiveStart = dto.StartDate ?? budget.StartDate;
            if (dto.EndDate.Value < effectiveStart)
                throw new InvalidOperationException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
            budget.EndDate = dto.EndDate.Value;
        }

        if (dto.TotalAmount.HasValue)
            budget.TotalAmount = dto.TotalAmount.Value;

        if (dto.Status.HasValue)
            budget.Status = dto.Status.Value;

        if (dto.PeriodType.HasValue)
            budget.PeriodType = dto.PeriodType.Value;

        if (dto.AutoRenew.HasValue)
            budget.AutoRenew = dto.AutoRenew.Value;

        budget.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(budget);
    }

    private static PersonalBudgetDto ToDto(WixiPersonalBudget b) => new()
    {
        Id = b.Id,
        HouseholdId = b.HouseholdId,
        Name = b.Name,
        StartDate = b.StartDate,
        EndDate = b.EndDate,
        TotalAmount = b.TotalAmount,
        TotalSpent = b.Categories.Sum(c => c.SpentAmount),
        Status = b.Status,
        PeriodType = b.PeriodType,
        AutoRenew = b.AutoRenew,
        Categories = b.Categories.Select(ToCategoryDto).ToList(),
        CreatedAt = b.CreatedAt,
        UpdatedAt = b.UpdatedAt,
    };

    private static PersonalBudgetCategoryDto ToCategoryDto(WixiPersonalBudgetCategory bc) => new()
    {
        Id = bc.Id,
        CategoryId = bc.CategoryId,
        CategoryName = bc.Category?.Name ?? string.Empty,
        CategoryIcon = bc.Category?.Icon ?? string.Empty,
        CategoryColor = bc.Category?.Color ?? string.Empty,
        AllocatedAmount = bc.AllocatedAmount,
        SpentAmount = bc.SpentAmount,
    };
}
