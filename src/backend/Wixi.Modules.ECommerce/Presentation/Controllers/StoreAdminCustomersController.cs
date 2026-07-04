using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.Crm.Commands.CreateCustomerNote;
using Wixi.Modules.ECommerce.Application.Crm.Commands.DeleteCustomerNote;
using Wixi.Modules.ECommerce.Application.Crm.Commands.SetCustomerBlacklist;
using Wixi.Modules.ECommerce.Application.Crm.Commands.UpdateCustomerConsent;
using Wixi.Modules.ECommerce.Application.Crm.Queries.GetCustomer360;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

/// <summary>
/// Customer management endpoints for the store admin panel (CRM M02).
/// List + 360° detail + notes + KVKK consent + blacklist.
/// </summary>
[ApiController]
[Route("api/v1/store-admin/customers")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminCustomersController : ControllerBase
{
    private readonly ECommerceDbContext _db;
    private readonly IMediator _mediator;

    public StoreAdminCustomersController(ECommerceDbContext db, IMediator mediator)
    {
        _db = db;
        _mediator = mediator;
    }

    private string CurrentUser =>
        User.FindFirstValue(ClaimTypes.Email) ?? User.Identity?.Name ?? "StoreAdmin";

    /// <summary>
    /// Returns a paginated list of customers, filterable by email/name and RFM segment.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? segment,
        [FromQuery] bool? blacklisted,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _db.Customers
            .AsNoTracking()
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(c =>
                c.Email.ToLower().Contains(s)
                || c.FirstName.ToLower().Contains(s)
                || c.LastName.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(segment))
            query = query.Where(c => c.RfmSegment == segment);

        if (blacklisted.HasValue)
            query = query.Where(c => c.IsBlacklisted == blacklisted.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerListDto(
                c.Id,
                c.FirstName,
                c.LastName,
                c.Email,
                c.PhoneNumber,
                c.IsEmailVerified,
                c.IsActive,
                c.CreatedAt,
                c.RfmSegment,
                c.LtvAmount,
                c.TotalOrders,
                c.LastOrderDate,
                c.IsBlacklisted))
            .ToListAsync(ct);

        return Ok(new
        {
            items,
            totalCount,
            page,
            pageSize
        });
    }

    /// <summary>
    /// Returns the 360° CRM view of a single customer
    /// (profile + recent orders + notes + addresses + consent + segment).
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var customer = await _mediator.Send(new GetCustomer360Query(id), ct);
        if (customer is null)
            return NotFound(new { error = "Müşteri bulunamadı." });

        return Ok(customer);
    }

    // ── Notlar ─────────────────────────────────────────────────────────

    [HttpPost("{id:guid}/notes")]
    public async Task<IActionResult> CreateNote(Guid id, [FromBody] CreateNoteRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { error = "Not içeriği boş olamaz." });

        var note = await _mediator.Send(
            new CreateCustomerNoteCommand(id, request.NoteType, request.Content, request.IsPrivate, CurrentUser), ct);

        if (note is null)
            return NotFound(new { error = "Müşteri bulunamadı." });

        return Ok(note);
    }

    [HttpDelete("notes/{noteId:guid}")]
    public async Task<IActionResult> DeleteNote(Guid noteId, CancellationToken ct)
    {
        var deleted = await _mediator.Send(new DeleteCustomerNoteCommand(noteId), ct);
        if (!deleted)
            return NotFound(new { error = "Not bulunamadı." });

        return NoContent();
    }

    // ── KVKK izinleri ──────────────────────────────────────────────────

    [HttpPatch("{id:guid}/consent")]
    public async Task<IActionResult> UpdateConsent(Guid id, [FromBody] UpdateConsentRequest request, CancellationToken ct)
    {
        var updated = await _mediator.Send(
            new UpdateCustomerConsentCommand(id, request.EmailOptIn, request.SmsOptIn, request.PushOptIn), ct);

        if (!updated)
            return NotFound(new { error = "Müşteri bulunamadı." });

        return NoContent();
    }

    // ── Kara liste ─────────────────────────────────────────────────────

    [HttpPatch("{id:guid}/blacklist")]
    public async Task<IActionResult> SetBlacklist(Guid id, [FromBody] BlacklistRequest request, CancellationToken ct)
    {
        if (request.IsBlacklisted && string.IsNullOrWhiteSpace(request.Reason))
            return BadRequest(new { error = "Kara listeye alma sebebi zorunludur." });

        var updated = await _mediator.Send(
            new SetCustomerBlacklistCommand(id, request.IsBlacklisted, request.Reason), ct);

        if (!updated)
            return NotFound(new { error = "Müşteri bulunamadı." });

        return NoContent();
    }
}

// ── Request DTOs ───────────────────────────────────────────────────────

public record CreateNoteRequest(int NoteType, string Content, bool IsPrivate = true);
public record UpdateConsentRequest(bool EmailOptIn, bool SmsOptIn, bool PushOptIn);
public record BlacklistRequest(bool IsBlacklisted, string? Reason);

// ── Response DTOs ──────────────────────────────────────────────────────

public record CustomerListDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    bool IsEmailVerified,
    bool IsActive,
    DateTime CreatedAt,
    string? RfmSegment,
    decimal LtvAmount,
    int TotalOrders,
    DateTime? LastOrderDate,
    bool IsBlacklisted);
