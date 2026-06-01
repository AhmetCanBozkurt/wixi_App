using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Sliders;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/sliders")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminSlidersController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminSlidersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all sliders with their slides. Pass includeInactive=true to include inactive ones.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetSlidersQuery(includeInactive));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Creates a new slider.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSliderCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing slider. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSliderCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Slider bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a slider.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteSliderCommand(id));
        if (!success)
            return NotFound(new { error = "Slider bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Adds a new slide to the specified slider.
    /// </summary>
    [HttpPost("{id}/slides")]
    public async Task<IActionResult> AddSlide(Guid id, [FromBody] AddSlideRequest request)
    {
        var command = new AddSlideCommand(id, request.Title, request.Subtitle, request.ImageUrl,
            request.ButtonText, request.ButtonUrl, request.SortOrder);
        var slideId = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { slideId }, new { id = slideId });
    }

    /// <summary>
    /// Soft-deletes a slide from the specified slider.
    /// </summary>
    [HttpDelete("{id}/slides/{slideId}")]
    public async Task<IActionResult> DeleteSlide(Guid id, Guid slideId)
    {
        var success = await _mediator.Send(new DeleteSlideCommand(slideId));
        if (!success)
            return NotFound(new { error = "Slayt bulunamadı." });

        return NoContent();
    }
}

public record AddSlideRequest(
    string? Title,
    string? Subtitle,
    string ImageUrl,
    string? ButtonText,
    string? ButtonUrl,
    int SortOrder);
