using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.PromoBanners;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/promo-banners")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminPromoBannersController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminPromoBannersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all promo banners. Pass includeInactive=true to include inactive ones.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetPromoBannersQuery(includeInactive));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Creates a new promo banner.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePromoBannerCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing promo banner. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePromoBannerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Promosyon banner'ı bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a promo banner.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeletePromoBannerCommand(id));
        if (!success)
            return NotFound(new { error = "Promosyon banner'ı bulunamadı." });

        return NoContent();
    }
}
