using MediatR;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;

namespace Wixi.Modules.WebBuilder.Application.Forms.Queries.GetWebFormBySlug;

public record GetWebFormBySlugQuery(Guid TenantId, string Slug) : IRequest<WebFormDto?>;
