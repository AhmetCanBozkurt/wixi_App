using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Wixi.Modules.Core.Application.Auth.Commands.Login;
using Wixi.Modules.Core.Application.Auth.Commands.Register;
using Wixi.Modules.Core.Infrastructure.Data;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Application.Auth.Queries.GetMe;
using Wixi.Modules.Core.Application.Auth.Commands.VerifyTwoFactor;
using Wixi.Modules.Core.Application.Auth.Commands.ResendTwoFactor;
using Wixi.Modules.Core.Application.Auth.Commands.RefreshToken;
using Wixi.Modules.Core.Application.Auth.Commands.ForgotPassword;
using Wixi.Modules.Core.Application.Auth.Commands.ResetPassword;
using Wixi.Modules.Core.Application.Auth.Commands.Logout;

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
        var result = await _mediator.Send(new LogoutCommand());
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        
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
        
        if (result.RequiresTwoFactor)
        {
            return Ok(new
            {
                requiresTwoFactor = true,
                twoFactorToken = result.TwoFactorToken
            });
        }

        return Ok(new
        {
            requiresTwoFactor = false,
            token = result.Token,
            accessToken = result.Token
        });
    }

    [AllowAnonymous]
    [HttpPost("verify-2fa")]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return Unauthorized(new { error = result.ErrorMessage });
        
        return Ok(new
        {
            token = result.Token,
            accessToken = result.Token
        });
    }

    [AllowAnonymous]
    [HttpPost("resend-2fa")]
    public async Task<IActionResult> ResendTwoFactor([FromBody] ResendTwoFactorCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        return Ok(new { success = true });
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var result = await _mediator.Send(new RefreshTokenCommand());
        if (!result.Success) return Unauthorized(new { error = result.ErrorMessage });

        return Ok(new
        {
            token = result.Token,
            accessToken = result.Token
        });
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        return Ok(new { success = true });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(new { error = result.ErrorMessage });
        return Ok(new { success = true });
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
