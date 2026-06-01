using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance.Application.Categories.Commands.DeletePersonalCategory;

public class DeletePersonalCategoryCommandHandler
    : IRequestHandler<DeletePersonalCategoryCommand, bool>
{
    private readonly WixiPersonalFinanceDbContext _db;

    public DeletePersonalCategoryCommandHandler(WixiPersonalFinanceDbContext db)
        => _db = db;

    public async Task<bool> Handle(
        DeletePersonalCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _db.PersonalCategories
            .FirstOrDefaultAsync(
                c => c.Id == request.CategoryId &&
                     c.UserId == request.UserId &&
                     !c.IsDeleted,
                cancellationToken);

        if (category is null) return false;

        var hasTransactions = await _db.PersonalTransactions
            .AnyAsync(t => t.CategoryId == request.CategoryId, cancellationToken);

        if (hasTransactions)
        {
            category.IsDeleted = true;
            await _db.SaveChangesAsync(cancellationToken);
            return true;
        }

        _db.PersonalCategories.Remove(category);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
