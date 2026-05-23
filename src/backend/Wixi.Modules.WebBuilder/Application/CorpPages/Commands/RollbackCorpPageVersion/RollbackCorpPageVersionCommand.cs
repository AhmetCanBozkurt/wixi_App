using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.RollbackCorpPageVersion;

public record RollbackCorpPageVersionCommand(Guid VersionId, Guid TenantId) : IRequest<Unit>;
