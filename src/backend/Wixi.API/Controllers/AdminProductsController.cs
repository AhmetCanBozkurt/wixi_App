using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Products.Commands.CreateProduct;
using Wixi.Modules.ECommerce.Application.Products.Commands.UpdateProduct;
using Wixi.Modules.ECommerce.Application.Products.Commands.DeleteProduct;
using Wixi.Modules.ECommerce.Application.Products.Queries.GetProducts;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/admin/ecommerce/products")]
[Authorize] // İlgili rol kontrolleri eklenebilir
public class AdminProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetProductsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id) return BadRequest(new { error = "ID mismatch" });
        var success = await _mediator.Send(command);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteProductCommand(id));
        if (!success) return NotFound();
        return NoContent();
    }
}
