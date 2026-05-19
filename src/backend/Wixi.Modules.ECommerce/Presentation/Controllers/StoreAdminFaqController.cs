using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.FaqItems;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/faq")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminFaqController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminFaqController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all FAQ items. Optionally filter by category or include inactive ones.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetFaqItemsQuery(category, includeInactive));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Creates a new FAQ item.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFaqItemCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing FAQ item. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFaqItemCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "SSS öğesi bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a FAQ item.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteFaqItemCommand(id));
        if (!success)
            return NotFound(new { error = "SSS öğesi bulunamadı." });

        return NoContent();
    }
}
