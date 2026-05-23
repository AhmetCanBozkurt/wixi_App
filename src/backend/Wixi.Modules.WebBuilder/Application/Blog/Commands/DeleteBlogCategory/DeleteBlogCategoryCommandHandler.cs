using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.DeleteBlogCategory;

public class DeleteBlogCategoryCommandHandler : IRequestHandler<DeleteBlogCategoryCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public DeleteBlogCategoryCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteBlogCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.BlogCategories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.TenantId == request.TenantId, cancellationToken);

        if (category is null)
            throw new KeyNotFoundException($"Blog kategorisi bulunamadı: {request.CategoryId}");

        category.IsDeleted = true;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
