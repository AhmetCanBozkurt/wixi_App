using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Testimonials;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/testimonials")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminTestimonialsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminTestimonialsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all testimonials. Pass includeInactive=true to include inactive ones.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetTestimonialsQuery(includeInactive));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Creates a new testimonial.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTestimonialCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing testimonial. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestimonialCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Yorum bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a testimonial.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteTestimonialCommand(id));
        if (!success)
            return NotFound(new { error = "Yorum bulunamadı." });

        return NoContent();
    }
}
