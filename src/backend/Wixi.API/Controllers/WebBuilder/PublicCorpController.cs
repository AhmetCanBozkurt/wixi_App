using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageBySlug;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPages;
using Wixi.Shared.Domain.Entities;

namespace Wixi.API.Controllers.WebBuilder;

[ApiController]
[Route("api/v1/public/corp")]
[AllowAnonymous]
public class PublicCorpController(IMediator mediator, WixiCoreDbContext db, ITenantContext tenantContext) : ControllerBase
{
    [HttpGet("{tenantSlug}/page/{pageSlug}")]
    public async Task<IActionResult> GetPage(string tenantSlug, string pageSlug, CancellationToken ct)
    {
        var tenant = await db.Tenants
            .Where(t => t.Slug == tenantSlug && !t.IsDeleted && t.IsActive)
            .Select(t => new { t.Id, t.ConnectionString, t.Slug })
            .FirstOrDefaultAsync(ct);

        if (tenant is null) return NotFound();

        tenantContext.Set(tenant.Id, tenant.ConnectionString, tenant.Slug);

        var page = await mediator.Send(new GetCorpPageBySlugQuery(tenant.Id, pageSlug), ct);

        // "home" bulunamazsa tenant'ın ilk yayınlanmış sayfasına fallback yap
        if ((page is null || !page.IsPublished) && pageSlug == "home")
        {
            var all = await mediator.Send(new GetCorpPagesQuery(tenant.Id), ct);
            var firstSlug = all.FirstOrDefault(p => p.IsPublished)?.Slug;
            if (firstSlug != null)
                page = await mediator.Send(new GetCorpPageBySlugQuery(tenant.Id, firstSlug), ct);
        }

        if (page is null || !page.IsPublished) return NotFound();

        return Ok(page);
    }

    [HttpGet("{tenantSlug}/pages")]
    public async Task<IActionResult> GetPages(string tenantSlug, CancellationToken ct)
    {
        var tenant = await db.Tenants
            .Where(t => t.Slug == tenantSlug && !t.IsDeleted && t.IsActive)
            .Select(t => new { t.Id, t.ConnectionString, t.Slug })
            .FirstOrDefaultAsync(ct);

        if (tenant is null) return NotFound();

        tenantContext.Set(tenant.Id, tenant.ConnectionString, tenant.Slug);

        var pages = await mediator.Send(new GetCorpPagesQuery(tenant.Id), ct);

        return Ok(pages.Where(p => p.IsPublished));
    }
}
