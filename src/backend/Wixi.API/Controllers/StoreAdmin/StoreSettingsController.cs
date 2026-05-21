using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.StoreSettings.Commands.UpdateStoreSettings;
using Wixi.Modules.ECommerce.Application.StoreSettings.Queries.GetStoreSettings;
using Wixi.Modules.ECommerce.Application.ThemeVersions.Commands.SaveThemeVersion;

namespace Wixi.API.Controllers.StoreAdmin;

[ApiController]
[Route("api/v1/store-admin")]
[Authorize]
public class StoreSettingsController : ControllerBase
{
    private readonly IMediator _mediator;
    public StoreSettingsController(IMediator mediator) => _mediator = mediator;

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
}

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
