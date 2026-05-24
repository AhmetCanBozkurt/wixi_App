using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageBacklinks;

public record UpdateCorpPageBacklinksCommand(
    Guid PageId,
    Guid TenantId,
    string? BacklinksJson) : IRequest<Unit>;
