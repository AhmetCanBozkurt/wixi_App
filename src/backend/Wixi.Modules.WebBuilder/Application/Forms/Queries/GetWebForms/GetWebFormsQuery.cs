using MediatR;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;

namespace Wixi.Modules.WebBuilder.Application.Forms.Queries.GetWebForms;

public record GetWebFormsQuery(Guid TenantId) : IRequest<List<WebFormListItemDto>>;
