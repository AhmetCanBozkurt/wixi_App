using MediatR;

namespace Wixi.Modules.WebBuilder.Application.CorpPages.Commands.UpdateCorpPageLayout;

public record UpdateCorpPageLayoutCommand(
    Guid PageId,
    Guid TenantId,
    string? LayoutConfigJson,
    string? ThemeOverrideJson) : IRequest<Unit>;
