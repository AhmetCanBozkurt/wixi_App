using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Port.Commands;

public record CreatePortCommand(
    string UnLocode,
    string Name,
    string? NameEn,
    string CountryCode,
    string? CityName,
    PortType Type,
    bool IsTurkish,
    int SortOrder) : IRequest<Guid>;

public class CreatePortCommandHandler : IRequestHandler<CreatePortCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreatePortCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePortCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiPort
        {
            UnLocode = request.UnLocode,
            Name = request.Name,
            NameEn = request.NameEn,
            CountryCode = request.CountryCode,
            CityName = request.CityName,
            Type = request.Type,
            IsTurkish = request.IsTurkish,
            SortOrder = request.SortOrder
        };

        _context.Ports.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
