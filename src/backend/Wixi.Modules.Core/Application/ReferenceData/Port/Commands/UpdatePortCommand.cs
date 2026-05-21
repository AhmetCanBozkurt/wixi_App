using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Port.Commands;

public record UpdatePortCommand(
    Guid Id,
    string UnLocode,
    string Name,
    string? NameEn,
    string CountryCode,
    string? CityName,
    PortType Type,
    bool IsTurkish,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdatePortCommandHandler : IRequestHandler<UpdatePortCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdatePortCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdatePortCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Ports
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.UnLocode = request.UnLocode;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.CountryCode = request.CountryCode;
        entity.CityName = request.CityName;
        entity.Type = request.Type;
        entity.IsTurkish = request.IsTurkish;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
