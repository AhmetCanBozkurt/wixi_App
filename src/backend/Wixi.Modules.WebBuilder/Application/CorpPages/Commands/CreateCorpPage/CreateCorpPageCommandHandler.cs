using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Application.CorpPages.Dto;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.CreateCorpPage;

public class CreateCorpPageCommandHandler : IRequestHandler<CreateCorpPageCommand, CorpPageDto>
{
    private readonly WebBuilderDbContext _db;

    public CreateCorpPageCommandHandler(WebBuilderDbContext db)
    {
        _db = db;
    }

    public async Task<CorpPageDto> Handle(CreateCorpPageCommand request, CancellationToken cancellationToken)
    {
        var slugExists = await _db.CorpPages
            .AnyAsync(p => p.TenantId == request.TenantId && p.Slug == request.Slug, cancellationToken);

        if (slugExists)
            throw new ArgumentException($"Bu tenant'ta '{request.Slug}' slug'ı zaten kullanımda.");

        var page = new WixiCorpPage
        {
            TenantId = request.TenantId,
            PageType = request.PageType,
            Slug = request.Slug,
            Title = request.Title
        };

        _db.CorpPages.Add(page);
        await _db.SaveChangesAsync(cancellationToken);

        return new CorpPageDto(
            page.Id,
            page.TenantId,
            page.PageType.ToString(),
            page.Slug,
            page.Title,
            page.LayoutConfigJson,
            page.ThemeOverrideJson,
            page.MetaTitle,
            page.MetaDescription,
            page.MetaKeywords,
            page.OpenGraphImageUrl,
            page.BacklinksJson,
            page.IsPublished,
            page.PublishedAt,
            page.CreatedAt,
            page.UpdatedAt);
    }
}
