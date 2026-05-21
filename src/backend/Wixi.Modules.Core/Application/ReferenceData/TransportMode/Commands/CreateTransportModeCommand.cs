using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.TransportMode.Commands;

public record CreateTransportModeCommand(
    string Code,
    string Name,
    string? NameEn,
    string? Icon,
    string? ColorHex,
    int SortOrder) : IRequest<Guid>;

public class CreateTransportModeCommandHandler : IRequestHandler<CreateTransportModeCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateTransportModeCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateTransportModeCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiTransportMode
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Icon = request.Icon,
            ColorHex = request.ColorHex,
            SortOrder = request.SortOrder
        };

        _context.TransportModes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
