using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.PublishCorpPage;

public record PublishCorpPageCommand(
    Guid PageId,
    Guid TenantId,
    bool IsPublished) : IRequest<Unit>;
