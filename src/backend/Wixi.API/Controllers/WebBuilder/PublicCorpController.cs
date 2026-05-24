using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageBySlug;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPages;

namespace Wixi.API.Controllers.WebBuilder;

[ApiController]
[Route("api/v1/public/corp")]
[AllowAnonymous]
public class PublicCorpController(IMediator mediator, WixiCoreDbContext db) : ControllerBase
{
    [HttpGet("{tenantSlug}/page/{pageSlug}")]
    public async Task<IActionResult> GetPage(string tenantSlug, string pageSlug, CancellationToken ct)
    {
        var tenantId = await db.Tenants
            .Where(t => t.Slug == tenantSlug && !t.IsDeleted)
            .Select(t => (Guid?)t.Id)
            .FirstOrDefaultAsync(ct);

        if (tenantId is null) return NotFound();

        var page = await mediator.Send(new GetCorpPageBySlugQuery(tenantId.Value, pageSlug), ct);

        if (page is null || !page.IsPublished) return NotFound();

        return Ok(page);
    }

    [HttpGet("{tenantSlug}/pages")]
    public async Task<IActionResult> GetPages(string tenantSlug, CancellationToken ct)
    {
        var tenantId = await db.Tenants
            .Where(t => t.Slug == tenantSlug && !t.IsDeleted)
            .Select(t => (Guid?)t.Id)
            .FirstOrDefaultAsync(ct);

        if (tenantId is null) return NotFound();

        var pages = await mediator.Send(new GetCorpPagesQuery(tenantId.Value), ct);

        return Ok(pages.Where(p => p.IsPublished));
    }
}
