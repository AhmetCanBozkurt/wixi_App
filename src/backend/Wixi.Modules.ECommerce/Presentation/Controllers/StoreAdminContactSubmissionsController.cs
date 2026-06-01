using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Application.ContactSubmissions;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/contact-submissions")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminContactSubmissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StoreAdminContactSubmissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Returns all contact form submissions. Pass unreadOnly=true to filter unread ones.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool unreadOnly = false)
    {
        var result = await _mediator.Send(new GetContactSubmissionsQuery(unreadOnly));
        return Ok(new { items = result });
    }

    /// <summary>
    /// Marks a contact submission as read.
    /// </summary>
    [HttpPut("{id}/mark-read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var success = await _mediator.Send(new MarkAsReadCommand(id));
        if (!success)
            return NotFound(new { error = "İletişim formu bulunamadı." });

        return NoContent();
    }

    /// <summary>
    /// Permanently deletes a contact submission.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _mediator.Send(new DeleteContactSubmissionCommand(id));
        if (!success)
            return NotFound(new { error = "İletişim formu bulunamadı." });

        return NoContent();
    }
}
