using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.StorePages.Commands.CreateStorePage;
using Wixi.Modules.ECommerce.Application.StorePages.Commands.DeleteStorePage;
using Wixi.Modules.ECommerce.Application.StorePages.Commands.PublishStorePage;
using Wixi.Modules.ECommerce.Application.StorePages.Commands.UpdateStorePageBacklinks;
using Wixi.Modules.ECommerce.Application.StorePages.Commands.UpdateStorePageLayout;
using Wixi.Modules.ECommerce.Application.StorePages.Commands.UpdateStorePageSeo;
using Wixi.Modules.ECommerce.Application.StorePages.Queries.GetStorePageBySlug;
using Wixi.Modules.ECommerce.Application.StorePages.Queries.GetStorePages;
using Wixi.Modules.ECommerce.Application.StoreSettings.Commands.UpdateStoreSettings;
using Wixi.Modules.ECommerce.Application.StoreSettings.Queries.GetStoreSettings;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.CreateCheckpoint;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.RollbackThemeVersion;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.SaveThemeVersion;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Queries.GetThemeVersionById;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Queries.GetThemeVersions;
using Wixi.Modules.ECommerce.Domain.Enums;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/store-admin")]
[Authorize]
public class StoreAdminSettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminSettingsController(IMediator mediator) => _mediator = mediator;

    // ── Store Settings ───────────────────────────────────────────────────────

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetStoreSettingsQuery(), ct);
        return Ok(result);
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateStoreSettingsRequest req, CancellationToken ct)
    {
        await _mediator.Send(new UpdateStoreSettingsCommand(
            req.StoreName, req.LogoUrl, req.FaviconUrl, req.ContactEmail, req.ContactPhone,
            req.Address, req.SocialLinksJson, req.SeoTitle, req.SeoDescription, req.Keywords,
            req.ThemeConfigJson, req.LayoutConfigJson, req.SupportedLanguages, req.DefaultLanguage,
            req.GlobalComponentsConfigJson, req.CustomCssOverride, req.CustomJsOverride), ct);

        await _mediator.Send(new SaveThemeVersionCommand(
            VersionType: "checkpoint",
            VersionLabel: null,
            ChangedByEmail: User.Identity?.Name), ct);

        return NoContent();
    }

    // ── Store Pages ──────────────────────────────────────────────────────────

    [HttpGet("pages")]
    public async Task<IActionResult> GetPages(CancellationToken ct)
    {
        var pages = await _mediator.Send(new GetStorePagesQuery(PublishedOnly: false), ct);
        return Ok(pages);
    }

    [HttpGet("pages/{slug}")]
    public async Task<IActionResult> GetPageBySlug(string slug, CancellationToken ct)
    {
        var page = await _mediator.Send(new GetStorePageBySlugQuery(slug, PublishedOnly: false), ct);
        if (page == null) return NotFound();
        return Ok(page);
    }

    [HttpPost("pages")]
    public async Task<IActionResult> CreatePage([FromBody] CreateStorePageRequest req, CancellationToken ct)
    {
        try
        {
            var page = await _mediator.Send(new CreateStorePageCommand(req.Title, req.Slug, req.PageType), ct);
            return CreatedAtAction(nameof(GetPageBySlug), new { slug = page.Slug }, page);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("pages/{id:guid}/layout")]
    public async Task<IActionResult> UpdateLayout(Guid id, [FromBody] UpdateLayoutRequest req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new UpdateStorePageLayoutCommand(id, req.LayoutConfigJson, req.ThemeOverrideJson), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("pages/{id:guid}/seo")]
    public async Task<IActionResult> UpdateSeo(Guid id, [FromBody] UpdateSeoRequest req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new UpdateStorePageSeoCommand(
                id, req.MetaTitle, req.MetaDescription, req.MetaKeywords, req.OpenGraphImageUrl), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("pages/{id:guid}/backlinks")]
    public async Task<IActionResult> UpdateBacklinks(Guid id, [FromBody] UpdateBacklinksRequest req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new UpdateStorePageBacklinksCommand(id, req.BacklinksJson), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("pages/{id:guid}/publish")]
    public async Task<IActionResult> PublishPage(Guid id, [FromBody] PublishPageRequest req, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new PublishStorePageCommand(id, req.IsPublished), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("pages/{id:guid}")]
    public async Task<IActionResult> DeletePage(Guid id, CancellationToken ct)
    {
        try
        {
            await _mediator.Send(new DeleteStorePageCommand(id), ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // ── Theme Versions ────────────────────────────────────────────────────────

    [HttpGet("theme-versions")]
    public async Task<IActionResult> GetThemeVersions(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetThemeVersionsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("theme-versions/{id:int}")]
    public async Task<IActionResult> GetThemeVersion(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetThemeVersionByIdQuery(id), ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("theme-versions/checkpoint")]
    public async Task<IActionResult> CreateCheckpoint([FromBody] CreateCheckpointRequest req, CancellationToken ct)
    {
        var id = await _mediator.Send(new CreateCheckpointCommand(req.Label, User.Identity?.Name), ct);
        return Ok(new { id });
    }

    [HttpPost("theme-versions/{id:int}/rollback")]
    public async Task<IActionResult> RollbackVersion(int id, CancellationToken ct)
    {
        var success = await _mediator.Send(new RollbackThemeVersionCommand(id, User.Identity?.Name), ct);
        if (!success) return NotFound();
        return NoContent();
    }
}

// ── Request Models ───────────────────────────────────────────────────────────

public record UpdateStoreSettingsRequest(
    string StoreName,
    string? LogoUrl,
    string? FaviconUrl,
    string? ContactEmail,
    string? ContactPhone,
    string? Address,
    string? SocialLinksJson,
    string? SeoTitle,
    string? SeoDescription,
    string? Keywords,
    string? ThemeConfigJson,
    string? LayoutConfigJson,
    string? SupportedLanguages = null,
    string? DefaultLanguage = null,
    string? GlobalComponentsConfigJson = null,
    string? CustomCssOverride = null,
    string? CustomJsOverride = null);

public record CreateCheckpointRequest(string Label);

public record CreateStorePageRequest(
    string Title,
    string Slug,
    StorePageType PageType = StorePageType.Custom);

public record UpdateLayoutRequest(
    string? LayoutConfigJson,
    string? ThemeOverrideJson = null);

public record UpdateSeoRequest(
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string? OpenGraphImageUrl);

public record UpdateBacklinksRequest(string? BacklinksJson);

public record PublishPageRequest(bool IsPublished);
