using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.DeleteCorpPage;

public record DeleteCorpPageCommand(Guid PageId, Guid TenantId) : IRequest<Unit>;
