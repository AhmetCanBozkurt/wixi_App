using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TransportMode.Commands;

public record UpdateTransportModeCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string? Icon,
    string? ColorHex,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateTransportModeCommandHandler : IRequestHandler<UpdateTransportModeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateTransportModeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateTransportModeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TransportModes
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Icon = request.Icon;
        entity.ColorHex = request.ColorHex;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
