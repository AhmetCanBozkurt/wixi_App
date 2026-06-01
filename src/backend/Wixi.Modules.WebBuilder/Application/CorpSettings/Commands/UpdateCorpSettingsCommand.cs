using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.WebBuilder.Domain.Entities;
using Wixi.Modules.WebBuilder.Infrastructure.Data;

namespace Wixi.Modules.WebBuilder.Application.CorpSettings.Commands;

public record UpdateCorpSettingsCommand(Guid TenantId, string? GlobalComponentsConfigJson) : IRequest;

public class UpdateCorpSettingsCommandHandler(WebBuilderDbContext db)
    : IRequestHandler<UpdateCorpSettingsCommand>
{
    public async Task Handle(UpdateCorpSettingsCommand request, CancellationToken ct)
    {
        var settings = await db.CorpSettings
            .FirstOrDefaultAsync(s => s.TenantId == request.TenantId, ct);

        if (settings is null)
        {
            settings = new WixiCorpSettings { TenantId = request.TenantId };
            db.CorpSettings.Add(settings);
        }

        settings.GlobalComponentsConfigJson = request.GlobalComponentsConfigJson;
        await db.SaveChangesAsync(ct);
    }
}
