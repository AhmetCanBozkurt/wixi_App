using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Products.Commands.CreateProduct;
using Wixi.Modules.ECommerce.Application.Products.Commands.DeleteProduct;
using Wixi.Modules.ECommerce.Application.Products.Commands.UpdateProduct;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProductBySlug;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProducts;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/products")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns a paginated, filterable list of the tenant's products.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetProductsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Returns a single product by its URL slug.
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _mediator.Send(new GetProductBySlugQuery(slug));
        if (result is null)
            return NotFound(new { error = "Ürün bulunamadı." });

        return Ok(result);
    }

    /// <summary>
    /// Creates a new product for the tenant's store.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    /// <summary>
    /// Updates an existing product. The route ID must match the command ID.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Ürün bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Soft-deletes a product.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteProductCommand(id));
        if (!success)
            return NotFound(new { error = "Ürün bulunamadı." });

        return NoContent();
    }
}
