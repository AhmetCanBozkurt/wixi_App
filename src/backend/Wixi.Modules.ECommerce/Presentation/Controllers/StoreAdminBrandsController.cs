using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Brands;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/brands")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminBrandsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminBrandsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all brands for the tenant's store.
    /// Pass includeInactive=true to include inactive brands.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetBrandsQuery(search, includeInactive));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Creates a new brand.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBrandCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing brand. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Marka bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a brand.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteBrandCommand(id));
        if (!success)
            return NotFound(new { error = "Marka bulunamadı." });

        return NoContent();
    }
}
