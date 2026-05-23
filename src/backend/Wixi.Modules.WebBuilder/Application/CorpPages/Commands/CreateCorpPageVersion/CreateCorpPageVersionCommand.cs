using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.CreateCorpPageVersion;

public record CreateCorpPageVersionCommand(
    Guid PageId,
    Guid TenantId,
    string? CheckpointLabel) : IRequest<Guid>;
