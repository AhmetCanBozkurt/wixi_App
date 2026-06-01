using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Microsoft.AspNetCore.Authorization;

namespace Wixi.API.Controllers.Core;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")]
public class MailingController : ControllerBase
{
    private readonly WixiCoreDbContext _context;

    public MailingController(WixiCoreDbContext context)
    {
        _context = context;
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await _context.MailTemplates
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(new { items = templates });
    }

    [HttpPost("templates")]
    public async Task<IActionResult> UpsertTemplate([FromBody] WixiMailTemplate template)
    {
        try
        {
            // Frontend may not send an id for new templates; check DB to decide insert vs update
            bool existsInDb = template.Id != Guid.Empty &&
                              await _context.MailTemplates.AnyAsync(t => t.Id == template.Id);

            if (!existsInDb)
            {
                // INSERT
                template.Id = Guid.NewGuid();
                template.CreatedAt = DateTime.UtcNow;
                template.IsDeleted = false;
                _context.MailTemplates.Add(template);
            }
            else
            {
                // UPDATE
                var existing = await _context.MailTemplates.FindAsync(template.Id);
                if (existing == null) return NotFound();

                existing.Code = template.Code;
                existing.Subject = template.Subject;
                existing.Body = template.Body;
                existing.Category = template.Category;
                existing.IsActive = template.IsActive;
                existing.UpdatedAt = DateTime.UtcNow;

                _context.MailTemplates.Update(existing);
            }

            await _context.SaveChangesAsync();
            return Ok(template);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _context.MailLogs
            .OrderByDescending(l => l.SentAt)
            .Take(100) // Limit for performance, will implement pagination if needed
            .ToListAsync();

        return Ok(new { items = logs });
    }

    [HttpGet("smtp")]
    public async Task<IActionResult> GetSmtpSettings([FromServices] MediatR.IMediator mediator)
    {
        var result = await mediator.Send(new Wixi.Modules.Core.Application.Mailing.Queries.GetSmtpSettings.GetSmtpSettingsQuery());
        if (result == null) return Ok(new { });
        return Ok(result);
    }

    [HttpPut("smtp")]
    public async Task<IActionResult> UpdateSmtpSettings([FromBody] Wixi.Modules.Core.Application.Mailing.Commands.UpdateSmtpSettings.UpdateSmtpSettingsCommand command, [FromServices] MediatR.IMediator mediator)
    {
        var result = await mediator.Send(command);
        return Ok(new { success = result });
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestEmail([FromBody] Wixi.Modules.Core.Application.Mailing.Commands.SendTestMail.SendTestMailCommand command, [FromServices] MediatR.IMediator mediator)
    {
        try
        {
            var result = await mediator.Send(command);
            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            // Return 400 with the actual error so frontend can display it to the user
            return BadRequest(new { success = false, error = ex.Message });
        }
    }
}
