using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.ResendTwoFactor;

public class ResendTwoFactorCommand : IRequest<AuthResult>
{
    public string TwoFactorToken { get; set; } = string.Empty;
}

