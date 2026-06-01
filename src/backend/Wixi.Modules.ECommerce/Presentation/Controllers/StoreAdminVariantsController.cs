using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Variants.Commands.CreateVariant;
using Wixi.Modules.ECommerce.Application.Variants.Commands.DeleteVariant;
using Wixi.Modules.ECommerce.Application.Variants.Commands.UpdateVariant;
using Wixi.Modules.ECommerce.Application.Variants.Queries.GetVariantsByProductId;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminVariantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminVariantsController(IMediator mediator) => _mediator = mediator;

    /// <summary>Returns all active variants for a product.</summary>
    [HttpGet("api/v1/store-admin/products/{productId:guid}/variants")]
    public async Task<IActionResult> GetByProduct(Guid productId)
    {
        var result = await _mediator.Send(new GetVariantsByProductIdQuery(productId));
        return Ok(result);
    }

    /// <summary>Creates a new variant for a product.</summary>
    [HttpPost("api/v1/store-admin/products/{productId:guid}/variants")]
    public async Task<IActionResult> Create(Guid productId, [FromBody] CreateVariantCommand command)
    {
        if (productId != command.ProductId)
            return BadRequest(new { error = "ProductId mismatch." });

        try
        {
            var id = await _mediator.Send(command);
            return Ok(new { id });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>Updates a variant.</summary>
    [HttpPut("api/v1/store-admin/variants/{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVariantCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success) return NotFound(new { error = "Varyant bulunamadı." });
        return NoContent();
    }

    /// <summary>Soft-deletes a variant.</summary>
    [HttpDelete("api/v1/store-admin/variants/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteVariantCommand(id));
        if (!success) return NotFound(new { error = "Varyant bulunamadı." });
        return NoContent();
    }
}
