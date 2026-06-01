using MediatR;
using Wixi.Modules.WebBuilder.Application.CorpPages.Dto;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Queries.GetCorpPageBySlug;

public record GetCorpPageBySlugQuery(Guid TenantId, string Slug) : IRequest<CorpPageDto?>;
