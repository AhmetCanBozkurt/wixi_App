using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Discounts;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/discounts")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminDiscountsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ECommerceDbContext _db;

    public StoreAdminDiscountsController(IMediator mediator, ECommerceDbContext db)
    {
        _mediator = mediator;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetCouponsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveCouponCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaveCouponCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });
        var result = await _mediator.Send(command);
        return Ok(new { id = result });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var affected = await _db.Coupons
            .Where(c => c.Id == id && !c.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.IsDeleted, true)
                .SetProperty(c => c.UpdatedAt, DateTime.UtcNow));

        if (affected == 0) return NotFound(new { error = "Kupon bulunamadı." });
        return NoContent();
    }
}
