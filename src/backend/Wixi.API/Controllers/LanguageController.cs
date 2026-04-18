using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Application.Languages.Commands.CreateLanguage;
using Wixi.Modules.Core.Application.Languages.Commands.DeleteLanguage;
using Wixi.Modules.Core.Application.Languages.Commands.UpdateLanguage;
using Wixi.Modules.Core.Application.Languages.Queries.GetLanguages;

using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.API.Controllers;

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/v1/[controller]")]
public class LanguageController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly Wixi.Modules.Core.Infrastructure.Data.WixiCoreDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public LanguageController(
        IMediator mediator, 
        Wixi.Modules.Core.Infrastructure.Data.WixiCoreDbContext context,
        ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLanguages([FromQuery] bool skipLog = false)
    {
        if (!skipLog)
        {
            // Son 5 saniye içinde aynı kullanıcının aynı tablo için attığı VIEW logu var mı?
            var recentLog = await _context.AuditLogs
                .Where(l => l.UserId == _currentUserService.UserId && 
                            l.Action == "VIEW" && 
                            l.TableName == "WIXI_LANGUAGES" && 
                            l.CreatedAt > DateTime.UtcNow.AddSeconds(-5))
                .AnyAsync();

            if (!recentLog)
            {
                await _context.LogActivityAsync("VIEW", "WIXI_LANGUAGES", null, "Kullanıcı diller listesini görüntüledi");
            }
        }
        var result = await _mediator.Send(new GetLanguagesQuery());
        return Ok(new { items = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLanguageCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateLanguageCommand command)
    {
        var result = await _mediator.Send(command);
        return result ? Ok() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteLanguageCommand(id));
        return result ? Ok() : BadRequest();
    }
}
