using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Budgets.Commands.DeletePersonalBudget;

public class DeletePersonalBudgetCommandHandler
    : IRequestHandler<DeletePersonalBudgetCommand, bool>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public DeletePersonalBudgetCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<bool> Handle(
        DeletePersonalBudgetCommand request,
        CancellationToken cancellationToken)
    {
        var budget = await _db.PersonalBudgets
            .FirstOrDefaultAsync(
                b => b.Id == request.BudgetId && b.UserId == request.UserId,
                cancellationToken);

        if (budget is null) return false;

        _db.PersonalBudgets.Remove(budget);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
