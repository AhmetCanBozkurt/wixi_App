using MediatR;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.CreateRole;

public record CreateRoleCommand(string Name, string? Description) : IRequest<bool>;

