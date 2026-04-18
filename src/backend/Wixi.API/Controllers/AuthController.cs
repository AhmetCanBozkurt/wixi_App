using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Wixi.Modules.Core.Application.Auth.Commands.Login;
using Wixi.Modules.Core.Application.Auth.Commands.Register;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Application.Auth.Queries.GetMe;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly WixiCoreDbContext _context;

    public AuthController(IMediator mediator, WixiCoreDbContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _context.LogActivityAsync("LOGOUT", null, null, "Kullanıcı oturumu sonlandırdı.", LogType.Security);
        return Ok(new { message = "Oturum başarıyla kapatıldı." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await _mediator.Send(new GetMeQuery());
        return result != null ? Ok(result) : NotFound();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
        {
            return Unauthorized(new { error = result.ErrorMessage });
        }
        return Ok(new { 
            token = result.Token,
            accessToken = result.Token 
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success)
        {
            return BadRequest(new { error = result.ErrorMessage });
        }
        return StatusCode(201, new { message = "Kullanıcı başarıyla oluşturuldu.", id = result.UserId });
    }
}
