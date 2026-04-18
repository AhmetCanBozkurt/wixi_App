using MediatR;
using Wixi.Modules.Core.Application.Auth.Dto;

namespace Wixi.Modules.Core.Application.Auth.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResult>
{
}

