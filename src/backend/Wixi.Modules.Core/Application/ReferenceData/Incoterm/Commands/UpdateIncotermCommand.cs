using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.ReferenceData.Incoterm.Commands;

public record UpdateIncotermCommand(
    Guid Id,
    string Code,
    string Name,
    string? NameEn,
    string Description,
    string? DescriptionEn,
    IncotermGroup Group,
    bool SellerPaysFreight,
    bool SellerPaysInsurance,
    int SortOrder,
    bool IsActive) : IRequest<bool>;

public class UpdateIncotermCommandHandler : IRequestHandler<UpdateIncotermCommand, bool>
{
    private readonly WixiCoreDbContext _context;

    public UpdateIncotermCommandHandler(WixiCoreDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateIncotermCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Incoterms
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null) return false;

        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.NameEn = request.NameEn;
        entity.Description = request.Description;
        entity.DescriptionEn = request.DescriptionEn;
        entity.Group = request.Group;
        entity.SellerPaysFreight = request.SellerPaysFreight;
        entity.SellerPaysInsurance = request.SellerPaysInsurance;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
