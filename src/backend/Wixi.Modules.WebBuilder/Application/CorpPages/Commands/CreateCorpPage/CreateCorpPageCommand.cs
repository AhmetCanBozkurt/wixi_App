using MediatR;
using Wixi.Modules.WebBuilder.Application.CorpPages.Dto;
using Wixi.Modules.WebBuilder.Domain.Enums;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.CreateCorpPage;

public record CreateCorpPageCommand(
    Guid TenantId,
    CorpPageType PageType,
    string Slug,
    string Title) : IRequest<CorpPageDto>;
