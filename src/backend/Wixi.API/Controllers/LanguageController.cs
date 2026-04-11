using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Languages.Commands.CreateLanguage;
using Wixi.Modules.Core.Application.Languages.Commands.DeleteLanguage;
using Wixi.Modules.Core.Application.Languages.Commands.UpdateLanguage;
using Wixi.Modules.Core.Application.Languages.Queries.GetLanguages;

namespace Wixi.API.Controllers;

[Authorize(Roles = "SuperAdmin,Admin")]
[ApiController]
[Route("api/v1/[controller]")]
public class LanguageController : ControllerBase
{
    private readonly IMediator _mediator;

    public LanguageController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetLanguages()
    {
        var result = await _mediator.Send(new GetLanguagesQuery());
        return Ok(result);
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
