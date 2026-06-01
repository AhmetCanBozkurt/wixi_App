using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Commands;

public record UpdateTaxOfficeCommand(
    Guid Id,
    string Code,
    string Name,
    string? CityName,
    string? CountryCode,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateTaxOfficeCommandHandler : IRequestHandler<UpdateTaxOfficeCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateTaxOfficeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateTaxOfficeCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TaxOffices
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.CityName = request.CityName;
        entity.CountryCode = request.CountryCode;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
