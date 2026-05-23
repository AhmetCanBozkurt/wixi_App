using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageVersions;

public record CorpPageVersionDto(
    Guid Id,
    string? CheckpointLabel,
    DateTime CreatedAt,
    string? CreatedByUser);

public record GetCorpPageVersionsQuery(Guid PageId, Guid TenantId) : IRequest<List<CorpPageVersionDto>>;
