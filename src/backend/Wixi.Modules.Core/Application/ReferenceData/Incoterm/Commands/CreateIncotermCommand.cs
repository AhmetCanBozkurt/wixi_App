using MediatR;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Incoterm.Commands;

public record CreateIncotermCommand(
    string Code,
    string Name,
    string? NameEn,
    string Description,
    string? DescriptionEn,
    IncotermGroup Group,
    bool SellerPaysFreight,
    bool SellerPaysInsurance,
    int SortOrder) : IRequest<Guid>;

public class CreateIncotermCommandHandler : IRequestHandler<CreateIncotermCommand, Guid>
{
    private readonly WixiCoreDbContext _context;

    public CreateIncotermCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateIncotermCommand request, CancellationToken cancellationToken)
    {
        var entity = new WixiIncoterm
        {
            Code = request.Code,
            Name = request.Name,
            NameEn = request.NameEn,
            Description = request.Description,
            DescriptionEn = request.DescriptionEn,
            Group = request.Group,
            SellerPaysFreight = request.SellerPaysFreight,
            SellerPaysInsurance = request.SellerPaysInsurance,
            SortOrder = request.SortOrder
        };

        _context.Incoterms.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
