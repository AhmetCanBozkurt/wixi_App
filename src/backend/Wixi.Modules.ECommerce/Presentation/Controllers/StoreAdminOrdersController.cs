using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Orders.Commands.UpdateOrderStatus;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrderById;
using Wixi.Modules.ECommerce.Application.Orders.Queries.GetOrders;
using Wixi.Modules.ECommerce.Domain.Entities;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/store-admin/orders")]
public class StoreAdminOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Sipariş listesini sayfalı olarak döner.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        OrderStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var parsed))
            statusFilter = parsed;

        var all = await _mediator.Send(new GetOrdersQuery(search, statusFilter), ct);

        var totalCount = all.Count;
        var items = all
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new { items, totalCount });
    }

    /// <summary>
    /// Belirli bir siparişin detaylarını döner (ürün kalemleri dahil).
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id), ct);
        if (result == null) return NotFound(new { error = "Sipariş bulunamadı." });
        return Ok(result);
    }

    /// <summary>
    /// Siparişin durumunu günceller (Pending → Processing → Shipped → Delivered | Cancelled | Refunded).
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest req, CancellationToken ct)
    {
        if (!Enum.TryParse<OrderStatus>(req.Status, true, out var newStatus))
            return BadRequest(new { error = $"Geçersiz durum: {req.Status}" });

        var success = await _mediator.Send(
            new UpdateOrderStatusCommand(id, newStatus, req.TrackingNumber, req.ShippingProvider), ct);

        if (!success) return NotFound(new { error = "Sipariş bulunamadı." });
        return Ok(new { message = "Sipariş durumu güncellendi." });
    }
}

public record UpdateOrderStatusRequest(
    string Status,
    string? TrackingNumber = null,
    string? ShippingProvider = null);
