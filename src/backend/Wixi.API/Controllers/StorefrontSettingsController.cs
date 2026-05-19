using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.StorePages.Queries.GetStorePageBySlug;
using Wixi.Modules.ECommerce.Application.StorePages.Queries.GetStorePages;
using Wixi.Modules.ECommerce.Application.StoreSettings.Queries.GetStoreSettings;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/public/storefront")]
[AllowAnonymous]
public class StorefrontSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontSettingsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetStoreSettingsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("theme")]
    public async Task<IActionResult> GetTheme(CancellationToken ct)
    {
        var settings = await _mediator.Send(new GetStoreSettingsQuery(), ct);
        return Ok(new { themeConfigJson = settings.ThemeConfigJson });
    }

    [HttpGet("pages")]
    public async Task<IActionResult> GetPages(CancellationToken ct)
    {
        var pages = await _mediator.Send(new GetStorePagesQuery(PublishedOnly: true), ct);
        return Ok(pages);
    }

    [HttpGet("page/{slug}")]
    public async Task<IActionResult> GetPage(string slug, CancellationToken ct)
    {
        var page = await _mediator.Send(new GetStorePageBySlugQuery(slug, PublishedOnly: true), ct);
        if (page == null) return NotFound();
        return Ok(page);
    }
}
