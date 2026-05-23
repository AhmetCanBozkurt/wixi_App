using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageSeo;

public record UpdateCorpPageSeoCommand(
    Guid PageId,
    Guid TenantId,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string? OpenGraphImageUrl,
    string? BacklinksJson) : IRequest<Unit>;
