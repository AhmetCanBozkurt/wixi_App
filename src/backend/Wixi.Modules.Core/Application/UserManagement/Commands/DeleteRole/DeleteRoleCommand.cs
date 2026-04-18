using MediatR;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.DeleteRole;

public record DeleteRoleCommand(Guid RoleId) : IRequest<bool>;

