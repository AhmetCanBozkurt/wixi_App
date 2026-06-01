using MediatR;
using Wixi.Modules.WebBuilder.Application.Forms.Dto;

namespace Wixi.Modules.WebBuilder.Application.Forms.Queries.GetFormSubmissions;

public record GetFormSubmissionsQuery(
    Guid FormId,
    Guid TenantId,
    int Skip = 0,
    int Take = 20) : IRequest<PagedResult<WebFormSubmissionDto>>;
