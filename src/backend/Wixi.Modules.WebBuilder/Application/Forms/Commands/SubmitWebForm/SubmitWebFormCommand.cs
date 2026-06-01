using MediatR;

namespace Wixi.Modules.WebBuilder.Application.Forms.Commands.SubmitWebForm;

public record SubmitWebFormCommand(
    Guid TenantId,
    string Slug,
    string? DataJson,
    string? IpAddress) : IRequest<Guid>;
