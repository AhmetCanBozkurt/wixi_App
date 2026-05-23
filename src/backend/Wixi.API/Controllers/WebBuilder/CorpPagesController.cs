using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.CreateCorpPage;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.CreateCorpPageVersion;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.DeleteCorpPage;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.PublishCorpPage;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.RollbackCorpPageVersion;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageLayout;
using Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageSeo;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageBySlug;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageVersions;
using Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPages;
using Wixi.Modules.WebBuilder.Domain.Enums;

namespace Wixi.API.Controllers.WebBuilder;

[ApiController]
[Route("api/v1/web-builder/pages")]
[Authorize]
public class CorpPagesController : WebBuilderControllerBase
{
    private readonly IMediator _mediator;

    public CorpPagesController(IMediator mediator, WixiCoreDbContext db) : base(db)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetCorpPagesQuery(tenantId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetCorpPageBySlugQuery(tenantId, slug), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCorpPageRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(
            new CreateCorpPageCommand(tenantId, request.PageType, request.Slug, request.Title),
            cancellationToken);
        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Slug }, result);
    }

    [HttpPut("{id}/layout")]
    public async Task<IActionResult> UpdateLayout(Guid id, [FromBody] UpdateCorpPageLayoutRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(
            new UpdateCorpPageLayoutCommand(id, tenantId, request.LayoutConfigJson, request.ThemeOverrideJson),
            cancellationToken);
        return NoContent();
    }

    [HttpPut("{id}/seo")]
    public async Task<IActionResult> UpdateSeo(Guid id, [FromBody] UpdateCorpPageSeoRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(
            new UpdateCorpPageSeoCommand(id, tenantId, request.MetaTitle, request.MetaDescription,
                request.MetaKeywords, request.OpenGraphImageUrl, request.BacklinksJson),
            cancellationToken);
        return NoContent();
    }

    [HttpPut("{id}/publish")]
    public async Task<IActionResult> Publish(Guid id, [FromBody] PublishCorpPageRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new PublishCorpPageCommand(id, tenantId, request.IsPublished), cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new DeleteCorpPageCommand(id, tenantId), cancellationToken);
        return NoContent();
    }

    [HttpGet("{id}/versions")]
    public async Task<IActionResult> GetVersions(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetCorpPageVersionsQuery(id, tenantId), cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id}/versions/checkpoint")]
    public async Task<IActionResult> CreateCheckpoint(Guid id, [FromBody] CreateCheckpointRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var versionId = await _mediator.Send(
            new CreateCorpPageVersionCommand(id, tenantId, request.CheckpointLabel),
            cancellationToken);
        return Ok(new { id = versionId });
    }

    [HttpPost("versions/{versionId}/rollback")]
    public async Task<IActionResult> Rollback(Guid versionId, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new RollbackCorpPageVersionCommand(versionId, tenantId), cancellationToken);
        return NoContent();
    }
}

public record CreateCorpPageRequest(CorpPageType PageType, string Slug, string Title);
public record UpdateCorpPageLayoutRequest(string? LayoutConfigJson, string? ThemeOverrideJson);
public record UpdateCorpPageSeoRequest(string? MetaTitle, string? MetaDescription, string? MetaKeywords, string? OpenGraphImageUrl, string? BacklinksJson);
public record PublishCorpPageRequest(bool IsPublished);
public record CreateCheckpointRequest(string? CheckpointLabel);
