using MediatR;

namespace Wixi.Modules.Core.Application.UserManagement.Commands.UpdateRole;

public record UpdateRoleCommand(Guid RoleId, string Name, string? Description) : IRequest<bool>;

