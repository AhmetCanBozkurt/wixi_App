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
using Wixi.Modules.ECommerce.Domain.Enums;

namespace Wixi.API.Controllers.StoreAdmin;

[ApiController]
[Route("api/v1/store-admin")]
[Authorize]
public class StorePagesController : ControllerBase
{
    private readonly IMediator _mediator;
    public StorePagesController(IMediator mediator) => _mediator = mediator;

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
}

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
