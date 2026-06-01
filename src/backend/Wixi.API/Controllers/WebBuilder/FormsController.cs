using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.WebBuilder.Application.Forms.Commands.CreateWebForm;
using Wixi.Modules.WebBuilder.Application.Forms.Commands.DeleteWebForm;
using Wixi.Modules.WebBuilder.Application.Forms.Commands.SubmitWebForm;
using Wixi.Modules.WebBuilder.Application.Forms.Commands.UpdateWebForm;
using Wixi.Modules.WebBuilder.Application.Forms.Queries.GetFormSubmissions;
using Wixi.Modules.WebBuilder.Application.Forms.Queries.GetWebFormBySlug;
using Wixi.Modules.WebBuilder.Application.Forms.Queries.GetWebForms;

namespace Wixi.API.Controllers.WebBuilder;

[ApiController]
[Route("api/v1/web-builder/forms")]
[Authorize]
public class FormsController : WebBuilderControllerBase
{
    private readonly IMediator _mediator;

    public FormsController(IMediator mediator, WixiCoreDbContext db) : base(db)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetForms(CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetWebFormsQuery(tenantId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetWebFormBySlugQuery(tenantId, slug), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWebFormRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(
            new CreateWebFormCommand(tenantId, request.Name, request.Slug,
                request.FieldsJson, request.SubmitButtonText ?? "Gönder",
                request.SuccessMessage, request.NotifyEmail),
            cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWebFormRequest request, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(
            new UpdateWebFormCommand(id, tenantId, request.Name, request.Slug,
                request.FieldsJson, request.SubmitButtonText ?? "Gönder",
                request.SuccessMessage, request.NotifyEmail),
            cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        await _mediator.Send(new DeleteWebFormCommand(id, tenantId), cancellationToken);
        return NoContent();
    }

    [HttpGet("{id}/submissions")]
    public async Task<IActionResult> GetSubmissions(
        Guid id,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 20,
        CancellationToken cancellationToken = default)
    {
        var tenantId = await ResolveTenantIdAsync(cancellationToken);
        var result = await _mediator.Send(new GetFormSubmissionsQuery(id, tenantId, skip, take), cancellationToken);
        return Ok(result);
    }
}

[ApiController]
[Route("api/v1/public/forms")]
public class PublicFormsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PublicFormsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("{slug}/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> Submit(string slug, [FromBody] PublicFormSubmitRequest request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.TenantId, out var tenantId))
            return BadRequest("Geçersiz tenant.");

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        var submissionId = await _mediator.Send(
            new SubmitWebFormCommand(tenantId, slug, request.DataJson, ipAddress),
            cancellationToken);

        return Ok(new { id = submissionId });
    }
}

public record CreateWebFormRequest(string Name, string Slug, string? FieldsJson, string? SubmitButtonText, string? SuccessMessage, string? NotifyEmail);
public record UpdateWebFormRequest(string Name, string Slug, string? FieldsJson, string? SubmitButtonText, string? SuccessMessage, string? NotifyEmail);
public record PublicFormSubmitRequest(string TenantId, string? DataJson);
