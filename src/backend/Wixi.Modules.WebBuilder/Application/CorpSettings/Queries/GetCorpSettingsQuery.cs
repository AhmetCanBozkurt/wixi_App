using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpSettings.Queries;

public record GetCorpSettingsQuery(Guid TenantId) : IRequest<CorpSettingsDto>;

public record CorpSettingsDto(string? GlobalComponentsConfigJson);

public class GetCorpSettingsQueryHandler(WebBuilderDbContext db)
    : IRequestHandler<GetCorpSettingsQuery, CorpSettingsDto>
{
    public async Task<CorpSettingsDto> Handle(GetCorpSettingsQuery request, CancellationToken ct)
    {
        var settings = await db.CorpSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, ct);

        return new CorpSettingsDto(settings?.GlobalComponentsConfigJson);
    }
}
