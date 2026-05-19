using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Addresses.Commands.DeleteAddress;
using Wixi.Modules.ECommerce.Application.Addresses.Commands.SaveAddress;
using Wixi.Modules.ECommerce.Application.Addresses.Queries.GetCustomerAddresses;
using Wixi.Modules.ECommerce.Domain.Entities;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/public/storefront/addresses")]
[Authorize(Roles = "StoreCustomer")]
public class StorefrontAddressController : ControllerBase
{
    private readonly IMediator _mediator;

    public StorefrontAddressController(IMediator mediator) => _mediator = mediator;

    private Guid GetCustomerId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Customer identity not found in token.");
        return Guid.Parse(raw);
    }

    [HttpGet]
    public async Task<IActionResult> GetAddresses(CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var result = await _mediator.Send(new GetCustomerAddressesQuery(customerId), ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAddress([FromBody] SaveAddressRequest body, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var command = new SaveAddressCommand(
            null,
            customerId,
            body.AddressType,
            body.Title,
            body.FirstName,
            body.LastName,
            body.Phone,
            body.AddressLine,
            body.City,
            body.District,
            body.ZipCode,
            body.IsDefault);

        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetAddresses), new { }, new { id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] SaveAddressRequest body, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var command = new SaveAddressCommand(
            id,
            customerId,
            body.AddressType,
            body.Title,
            body.FirstName,
            body.LastName,
            body.Phone,
            body.AddressLine,
            body.City,
            body.District,
            body.ZipCode,
            body.IsDefault);

        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid id, CancellationToken ct)
    {
        var customerId = GetCustomerId();
        var deleted = await _mediator.Send(new DeleteAddressCommand(id, customerId), ct);
        return deleted ? NoContent() : NotFound();
    }
}

public record SaveAddressRequest(
    AddressType AddressType,
    string Title,
    string FirstName,
    string LastName,
    string Phone,
    string AddressLine,
    string City,
    string District,
    string? ZipCode,
    bool IsDefault
);
