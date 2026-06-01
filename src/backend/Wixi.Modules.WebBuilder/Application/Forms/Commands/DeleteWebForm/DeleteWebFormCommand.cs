using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.DeleteWebForm;

public record DeleteWebFormCommand(Guid FormId, Guid TenantId) : IRequest<Unit>;
