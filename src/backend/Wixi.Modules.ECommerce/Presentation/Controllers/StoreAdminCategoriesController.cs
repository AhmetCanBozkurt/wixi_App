using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Categories;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/categories")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminCategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all categories for the tenant's store, including parent info.
    /// Pass includeInactive=true to include inactive categories.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool includeInactive = false)
    {
        var result = await _mediator.Send(new GetCategoriesQuery(search, includeInactive));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Creates a new category.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing category. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Kategori bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a category.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteCategoryCommand(id));
        if (!success)
            return NotFound(new { error = "Kategori bulunamadı." });

        return NoContent();
    }
}
