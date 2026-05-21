using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TaxOffice.Commands;

public record CreateTaxOfficeCommand(
    string Code,
    string Name,
    string? CityName,
    string? CountryCode,
    int SortOrder) : IRequest<Guid>;

public class CreateTaxOfficeCommandHandler : IRequestHandler<CreateTaxOfficeCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateTaxOfficeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTaxOfficeCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiTaxOffice
        {
            Code = request.Code,
            Name = request.Name,
            CityName = request.CityName,
            CountryCode = request.CountryCode ?? "TR",
            SortOrder = request.SortOrder
        };

        _context.TaxOffices.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
