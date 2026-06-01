using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.Blog.Commands.UpdateBlogCategory;

public class UpdateBlogCategoryCommandHandler : IRequestHandler<UpdateBlogCategoryCommand, Unit>
{
    private readonly WebBuilderDbContext _db;

    public UpdateBlogCategoryCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateBlogCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.BlogCategories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.TenantId == request.TenantId, cancellationToken);

        if (category is null)
            throw new KeyNotFoundException($"Blog kategorisi bulunamadı: {request.CategoryId}");

        var slugConflict = await _db.BlogCategories
            .AnyAsync(c => c.TenantId == request.TenantId && c.Slug == request.Slug && c.Id != request.CategoryId, cancellationToken);

        if (slugConflict)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı başka bir kategoride kullanımda.");

        category.Name = request.Name;
        category.Slug = request.Slug;
        category.Description = request.Description;
        category.SortOrder = request.SortOrder;

        await _db.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
