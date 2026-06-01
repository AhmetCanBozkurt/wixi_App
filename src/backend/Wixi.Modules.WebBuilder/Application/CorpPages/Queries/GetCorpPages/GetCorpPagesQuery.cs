using MediatR;
using Wixi.Modules.WebBuilder.Application.CorpPages.Dto;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPages;

public record GetCorpPagesQuery(Guid TenantId) : IRequest<List<CorpPageListItemDto>>;
