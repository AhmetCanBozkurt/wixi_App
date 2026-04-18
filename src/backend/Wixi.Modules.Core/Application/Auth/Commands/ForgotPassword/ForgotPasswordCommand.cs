using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommand : IRequest<AuthResult>
{
    public string Email { get; set; } = string.Empty;
}

