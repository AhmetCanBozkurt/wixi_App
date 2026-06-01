using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.Cari.Commands.CreateContact;
using Wixi.Modules.ECommerce.Application.Cari.Commands.CreateLedgerEntry;
using Wixi.Modules.ECommerce.Application.Cari.Commands.UpdateContact;
using Wixi.Modules.ECommerce.Application.Cari.Queries.GetContactLedger;
using Wixi.Modules.ECommerce.Application.Cari.Queries.GetContacts;
using Wixi.Modules.ECommerce.Domain.Entities;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/cari")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminCariController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminCariController(IMediator mediator) => _mediator = mediator;

    /// <summary>Returns contacts filtered by search term, type, and active status.</summary>
    [HttpGet]
    public async Task<IActionResult> GetContacts(
        [FromQuery] string? search,
        [FromQuery] ContactType? type,
        [FromQuery] bool? isActive)
    {
        var result = await _mediator.Send(new GetContactsQuery(search, type, isActive));
        return Ok(result);
    }

    /// <summary>Creates a new contact (supplier, B2B customer, or dealer).</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateContactCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }

    /// <summary>Updates an existing contact. Route ID must match command ID.</summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateContactCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { error = "ID mismatch." });

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { error = "Cari kart bulunamadi." });

        return NoContent();
    }

    /// <summary>Returns paginated ledger entries for a contact including current balance snapshot.</summary>
    [HttpGet("{id}/ledger")]
    public async Task<IActionResult> GetLedger(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        var result = await _mediator.Send(new GetContactLedgerQuery(id, page, pageSize));
        if (result is null)
            return NotFound(new { error = "Cari kart bulunamadi." });

        return Ok(result);
    }

    /// <summary>Creates a debit or credit ledger entry for a contact and updates its running balance.</summary>
    [HttpPost("{id}/ledger")]
    public async Task<IActionResult> CreateLedgerEntry(Guid id, [FromBody] CreateLedgerEntryCommand command)
    {
        if (id != command.ContactId)
            return BadRequest(new { error = "ID mismatch." });

        var entryId = await _mediator.Send(command);
        return Ok(new { id = entryId });
    }
}
