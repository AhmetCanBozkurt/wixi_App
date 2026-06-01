using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Application.Budgets.Dto;
using Wixi.Modules.PersonalFinance.Domain.Entities;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Queries.GetPersonalBudgetById;

public class GetPersonalBudgetByIdQueryHandler
    : IRequestHandler<GetPersonalBudgetByIdQuery, PersonalBudgetDto>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public GetPersonalBudgetByIdQueryHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<PersonalBudgetDto> Handle(
        GetPersonalBudgetByIdQuery request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.PersonalBudgets
            .Include(b => b.Categories)
            .ThenInclude(bc => bc.Category)
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.UserId == request.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException("Bütçe bulunamadı.");

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
