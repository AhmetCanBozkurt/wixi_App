using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance.Application.Categories.Commands.DeleteFinanceCategory;

public class DeleteFinanceCategoryCommandHandler
    : IRequestHandler<DeleteFinanceCategoryCommand, bool>
{
    private readonly WixiFinanceDbContext _db;

    public DeleteFinanceCategoryCommandHandler(WixiFinanceDbContext db) => _db = db;

    public async Task<bool> Handle(
        DeleteFinanceCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _db.FinanceCategories
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId && c.TenantId == request.TenantId && !c.IsDeleted,
                cancellationToken);

        if (category is null) return false;

        var hasTransactions = await _db.FinanceTransactions
            .AnyAsync(t => t.CategoryId == request.CategoryId, cancellationToken);

        if (hasTransactions)
        {
            // Soft delete — category has linked transactions
            category.IsDeleted = true;
            await _db.SaveChangesAsync(cancellationToken);
        }
        else
        {
            _db.FinanceCategories.Remove(category);
            await _db.SaveChangesAsync(cancellationToken);
        }

        return true;
    }
}
